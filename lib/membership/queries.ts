import { createServerSupabaseClient } from '@lib/db'

import type { Subscription, Contract, MembershipStatus } from './types'

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getSubscription error:', error.message)
    return null
  }

  return data as Subscription | null
}

export async function getLatestContract(userId: string): Promise<Contract | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', userId)
    .order('signed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getLatestContract error:', error.message)
    return null
  }

  return data as Contract | null
}

export async function getMembershipStatus(
  userId: string,
  role: string
): Promise<MembershipStatus> {
  const [subscription, contract] = await Promise.all([
    getSubscription(userId),
    getLatestContract(userId),
  ])

  const isBuilder = role === 'builder' || role === 'operator'
  const hasActiveSubscription = subscription?.status === 'active'

  return {
    tier: isBuilder ? 'builder' : 'fan',
    subscription,
    contract,
    canUpgrade: !isBuilder && !hasActiveSubscription,
    canCancel: hasActiveSubscription && !subscription?.cancel_at,
  }
}
