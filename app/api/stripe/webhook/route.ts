import { NextResponse } from 'next/server'
import Stripe from 'stripe'

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
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.parent?.subscription_details?.subscription
        if (subId && typeof subId === 'string') {
          const subscription = await getStripe().subscriptions.retrieve(subId)
          await handleSubscriptionChange(subscription)
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
    await updateProfileRoleFromWebhook(userId, 'fan')
  }
}
