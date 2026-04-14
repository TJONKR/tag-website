import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { createServiceRoleClient } from '@lib/db'
import {
  getUserEmail,
  sendPaymentFailed,
  sendSubscriptionActive,
  sendSubscriptionCancelled,
} from '@lib/email/senders'
import {
  upsertSubscriptionFromWebhook,
  updateProfileRoleFromWebhook,
} from '@lib/membership/mutations'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription && session.customer) {
          const subscription = await getStripe().subscriptions.retrieve(
            session.subscription as string
          )
          await handleSubscriptionChange(subscription)
          // New subscription → welcome to Builder email
          await notifySubscriptionActive(subscription)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        await notifySubscriptionCancelled(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.parent?.subscription_details?.subscription
        if (subId && typeof subId === 'string') {
          const subscription = await getStripe().subscriptions.retrieve(subId)
          await handleSubscriptionChange(subscription)
          await notifyPaymentFailed(subscription, invoice)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id
  if (!userId) {
    console.error('No supabase_user_id in subscription metadata')
    return
  }

  const status = subscription.status
  const cancelAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000)
    : null

  // In Stripe v20, period dates are on items
  const firstItem = subscription.items.data[0]
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000)
    : new Date()
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : new Date()

  await upsertSubscriptionFromWebhook({
    userId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    status,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAt,
  })

  if (status === 'active') {
    await updateProfileRoleFromWebhook(userId, 'builder')
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateProfileRoleFromWebhook(userId, 'ambassador')
  }
}

async function resolveRecipient(
  userId: string
): Promise<{ email: string; name?: string } | null> {
  const email = await getUserEmail(userId)
  if (!email) return null

  try {
    const client = createServiceRoleClient()
    const { data } = await client
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()
    return { email, name: data?.name ?? undefined }
  } catch {
    return { email }
  }
}

async function notifySubscriptionActive(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id
  if (!userId || subscription.status !== 'active') return
  const recipient = await resolveRecipient(userId)
  if (!recipient) return
  await sendSubscriptionActive({ to: recipient.email, name: recipient.name })
}

async function notifySubscriptionCancelled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id
  if (!userId) return
  const recipient = await resolveRecipient(userId)
  if (!recipient) return

  const endTs = subscription.cancel_at ?? subscription.canceled_at
  const endsOn = endTs
    ? new Date(endTs * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : undefined

  await sendSubscriptionCancelled({ to: recipient.email, name: recipient.name, endsOn })
}

async function notifyPaymentFailed(
  subscription: Stripe.Subscription,
  invoice: Stripe.Invoice
) {
  const userId = subscription.metadata.supabase_user_id
  if (!userId) return
  const recipient = await resolveRecipient(userId)
  if (!recipient) return

  const amountDue =
    typeof invoice.amount_due === 'number' && invoice.currency
      ? new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: invoice.currency.toUpperCase(),
        }).format(invoice.amount_due / 100)
      : undefined

  await sendPaymentFailed({ to: recipient.email, name: recipient.name, amountDue })
}
