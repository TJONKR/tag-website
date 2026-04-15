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

async function fetchProfile(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, name, avatar_url, created_at, is_super_admin')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('fetchProfile error:', error.message, 'userId:', userId)
  }

  return {
    role: (data?.role as UserRole) ?? 'ambassador',
    name: (data?.name as string | null) ?? null,
    avatar_url: (data?.avatar_url as string | null) ?? null,
    created_at: (data?.created_at as string) ?? new Date().toISOString(),
    is_super_admin: Boolean(data?.is_super_admin),
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

  const profile = await fetchProfile(supabase, user.id)

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

  const profile = await fetchProfile(supabase, user.id)

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
