import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@lib/db'

import type { AuthUser, UserRole } from './types'

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
