import { redirect } from 'next/navigation'

import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { AuthUser, PublicProfile, UserRole } from './types'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) throw error
  return session
}

// Lazily creates a minimal profile if one is missing. Covers the rare case
// where the auth user exists but the handle_new_user trigger didn't produce
// a profile row (e.g., trigger was disabled, manual auth.users insert via
// dashboard, or hardened trigger fell through to the safety-net branch).
async function healMissingProfile(
  userId: string,
  fallbackName: string | null
): Promise<void> {
  const service = createServiceRoleClient()
  const { error } = await service
    .from('profiles')
    .insert({ id: userId, name: fallbackName, onboarding_completed: false })

  if (error && !error.message.toLowerCase().includes('duplicate')) {
    console.error('[healMissingProfile] insert failed:', error.message, 'userId:', userId)
  }
}

async function fetchProfile(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  fallbackName: string | null = null
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, name, avatar_url, created_at, is_super_admin')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('fetchProfile error:', error.message, 'userId:', userId)
  }

  if (!data) {
    console.warn('[fetchProfile] no profile for user, healing:', userId)
    await healMissingProfile(userId, fallbackName)

    const { data: healed } = await supabase
      .from('profiles')
      .select('role, name, avatar_url, created_at, is_super_admin')
      .eq('id', userId)
      .maybeSingle()

    return {
      role: (healed?.role as UserRole) ?? 'ambassador',
      name: (healed?.name as string | null) ?? fallbackName,
      avatar_url: (healed?.avatar_url as string | null) ?? null,
      created_at: (healed?.created_at as string) ?? new Date().toISOString(),
      is_super_admin: Boolean(healed?.is_super_admin),
    }
  }

  return {
    role: (data.role as UserRole) ?? 'ambassador',
    name: (data.name as string | null) ?? null,
    avatar_url: (data.avatar_url as string | null) ?? null,
    created_at: (data.created_at as string) ?? new Date().toISOString(),
    is_super_admin: Boolean(data.is_super_admin),
  }
}

export async function getMemberCount(): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('getMemberCount error:', error.message)
    return 0
  }

  return count ?? 0
}

export async function getOptionalUser(): Promise<AuthUser | null> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const fallbackName = (user.user_metadata?.name as string | undefined) ?? null
  const profile = await fetchProfile(supabase, user.id, fallbackName)

  return {
    id: user.id,
    email: user.email || '',
    name: profile.name,
    role: profile.role,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    is_super_admin: profile.is_super_admin,
  }
}

export async function getPublicProfile(slug: string): Promise<PublicProfile | null> {
  const supabase = createServiceRoleClient()

  // Convert slug back to name pattern for case-insensitive matching
  const namePattern = slug.replace(/-/g, ' ')

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, name, role, avatar_url, building, why_tag, linkedin_url, twitter_url, github_url, website_url, instagram_url, created_at'
    )
    .ilike('name', `${namePattern}`)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.name,
    role: data.role as UserRole,
    avatar_url: data.avatar_url,
    building: data.building,
    why_tag: data.why_tag,
    linkedin_url: data.linkedin_url,
    twitter_url: data.twitter_url,
    github_url: data.github_url,
    website_url: data.website_url,
    instagram_url: data.instagram_url,
    created_at: data.created_at,
  }
}

export async function getUser(): Promise<AuthUser> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const fallbackName = (user.user_metadata?.name as string | undefined) ?? null
  const profile = await fetchProfile(supabase, user.id, fallbackName)

  return {
    id: user.id,
    email: user.email || '',
    name: profile.name,
    role: profile.role,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    is_super_admin: profile.is_super_admin,
  }
}
