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
    allow_promotion_codes: true,
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
  pdfUrl: string | undefined,
  fields: {
    companyName: string
    kvk: string
    city: string
    representativeName: string
    language: 'nl' | 'en'
  }
) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('contracts').insert({
    user_id: userId,
    version,
    pdf_url: pdfUrl ?? null,
    company_name: fields.companyName,
    kvk: fields.kvk,
    city: fields.city,
    representative_name: fields.representativeName,
    language: fields.language,
  })

  if (error) throw new Error(error.message)
}

// AI/AM claim lifecycle ------------------------------------------------------

export async function createAiAmClaim(userId: string): Promise<{ id: string }> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('ai_am_claims')
    .insert({ user_id: userId, status: 'pending' })
    .select('id')
    .single()

  if (error) {
    // Unique partial index on (user_id) WHERE status='pending' may fire
    if (error.code === '23505') {
      throw new Error('You already have a pending AI/AM claim.')
    }
    throw new Error(error.message)
  }

  return { id: data.id as string }
}

export async function reviewAiAmClaim(
  claimId: string,
  reviewerId: string,
  status: 'approved' | 'rejected' | 'revoked',
  notes?: string
) {
  // Service role: bypass RLS, also allows role flip on profiles.
  // Caller MUST verify reviewer is_super_admin before invoking.
  const supabase = createServiceRoleClient()

  const { data: claim, error: fetchError } = await supabase
    .from('ai_am_claims')
    .select('id, user_id, status')
    .eq('id', claimId)
    .single()

  if (fetchError || !claim) throw new Error('Claim not found')

  // Idempotency: only allow valid transitions
  if (status === 'approved' && claim.status !== 'pending') {
    throw new Error(`Cannot approve claim in status "${claim.status}"`)
  }
  if (status === 'rejected' && claim.status !== 'pending') {
    throw new Error(`Cannot reject claim in status "${claim.status}"`)
  }
  if (status === 'revoked' && claim.status !== 'approved') {
    throw new Error(`Cannot revoke claim in status "${claim.status}"`)
  }

  const { error: updateError } = await supabase
    .from('ai_am_claims')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      notes: notes ?? null,
    })
    .eq('id', claimId)

  if (updateError) throw new Error(updateError.message)

  // Role flip — promote on approved, demote on revoked
  if (status === 'approved') {
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: 'builder' })
      .eq('id', claim.user_id)
    if (roleError) throw new Error(roleError.message)
  } else if (status === 'revoked') {
    // Only demote if user has no active Stripe sub keeping them Builder
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', claim.user_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!sub) {
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'ambassador' })
        .eq('id', claim.user_id)
      if (roleError) throw new Error(roleError.message)
    }
  }
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
