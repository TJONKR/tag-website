import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type {
  Subscription,
  Contract,
  MembershipStatus,
  AiAmClaim,
  AiAmClaimWithUser,
} from './types'

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

export async function getActiveAiAmClaim(userId: string): Promise<AiAmClaim | null> {
  const supabase = await createServerSupabaseClient()

  // Active = pending or approved (not rejected/revoked)
  const { data, error } = await supabase
    .from('ai_am_claims')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'approved'])
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getActiveAiAmClaim error:', error.message)
    return null
  }

  return data as AiAmClaim | null
}

export async function getAiAmClaimsByStatus(
  status: 'pending' | 'approved' | 'rejected' | 'revoked'
): Promise<AiAmClaimWithUser[]> {
  // Service role to bypass RLS — caller must verify is_super_admin first
  const supabase = createServiceRoleClient()

  const { data: claims, error } = await supabase
    .from('ai_am_claims')
    .select('*')
    .eq('status', status)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('getAiAmClaimsByStatus error:', error.message)
    return []
  }

  if (!claims || claims.length === 0) return []

  // Join with profiles + auth.users (email lives in auth.users)
  const userIds = claims.map((c) => c.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds)

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailById = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.email ?? null])
  )
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

  return claims.map((claim) => ({
    ...(claim as AiAmClaim),
    user: {
      id: claim.user_id,
      name: profileById.get(claim.user_id)?.name ?? null,
      email: emailById.get(claim.user_id) ?? null,
    },
  }))
}

export async function getMembershipStatus(
  userId: string,
  role: string
): Promise<MembershipStatus> {
  const [subscription, contract, aiAmClaim] = await Promise.all([
    getSubscription(userId),
    getLatestContract(userId),
    getActiveAiAmClaim(userId),
  ])

  const isBuilder = role === 'builder' || role === 'operator'
  const hasActiveSubscription = subscription?.status === 'active'
  const hasActiveClaim =
    aiAmClaim?.status === 'pending' || aiAmClaim?.status === 'approved'

  return {
    tier: isBuilder ? 'builder' : 'ambassador',
    subscription,
    contract,
    aiAmClaim,
    canUpgrade: !isBuilder && !hasActiveSubscription && !hasActiveClaim,
    canCancel: hasActiveSubscription && !subscription?.cancel_at,
  }
}
