import Stripe from 'stripe'

import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createOrGetStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  const customer = await getStripe().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })

  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer.id
}

export async function createCheckoutSession(
  customerId: string,
  userId: string
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/portal/profile?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/portal/profile?upgrade=canceled`,
    subscription_data: {
      metadata: { supabase_user_id: userId },
    },
  })

  return session.url!
}

export async function createBillingPortalSession(
  customerId: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/portal/profile`,
  })

  return session.url
}

export async function insertContract(
  userId: string,
  version: string,
  pdfUrl?: string
) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('contracts').insert({
    user_id: userId,
    version,
    pdf_url: pdfUrl ?? null,
  })

  if (error) throw new Error(error.message)
}

export async function upsertSubscriptionFromWebhook(data: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAt: Date | null
}) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: data.userId,
        stripe_customer_id: data.stripeCustomerId,
        stripe_subscription_id: data.stripeSubscriptionId,
        status: data.status,
        current_period_start: data.currentPeriodStart.toISOString(),
        current_period_end: data.currentPeriodEnd.toISOString(),
        cancel_at: data.cancelAt?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    )

  if (error) throw new Error(error.message)
}

export async function updateProfileRoleFromWebhook(
  userId: string,
  role: 'ambassador' | 'builder'
) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}
