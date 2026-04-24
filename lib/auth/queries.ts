import { redirect } from 'next/navigation'

import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { Rarity } from '@lib/lootbox/types'

import type { AuthUser, PublicProfile, PublicTaste, UserRole } from './types'

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
    .insert({ id: userId, name: fallbackName?.trim() ?? null, onboarding_completed: false })

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

  const [taste, equippedSkin] = await Promise.all([
    getPublicTaste(data.id),
    getEquippedSkin(data.id),
  ])

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
    equipped_skin_url: equippedSkin?.image_url ?? null,
    equipped_skin_rarity: equippedSkin?.rarity ?? null,
    taste,
  }
}

async function getPublicTaste(userId: string): Promise<PublicTaste | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('builder_profiles')
    .select(
      'headline, bio, tags, projects, interests, notable_work, influences, key_links, prophecy_chosen, show_headline, show_bio, show_tags, show_projects, show_interests, show_notable_work, show_influences, show_key_links, show_prophecy'
    )
    .eq('user_id', userId)
    .eq('status', 'complete')
    .maybeSingle()

  if (error || !data) return null

  return {
    headline: data.show_headline ? data.headline : null,
    bio: data.show_bio ? data.bio : null,
    tags: data.show_tags ? data.tags : null,
    projects: data.show_projects ? data.projects : null,
    interests: data.show_interests ? data.interests : null,
    notable_work: data.show_notable_work ? data.notable_work : null,
    influences: data.show_influences ? data.influences : null,
    key_links: data.show_key_links ? data.key_links : null,
    prophecy: data.show_prophecy ? data.prophecy_chosen : null,
  }
}

async function getEquippedSkin(
  userId: string
): Promise<{ image_url: string; rarity: Rarity } | null> {
  const supabase = createServiceRoleClient()

  const { data } = await supabase
    .from('user_skins')
    .select('image_url, rarity')
    .eq('user_id', userId)
    .eq('equipped', true)
    .maybeSingle()

  if (data?.image_url) {
    return { image_url: data.image_url, rarity: (data.rarity as Rarity) ?? 'common' }
  }

  // Fallback to legacy builder_profiles.skin_url — rarity unknown, treat as common.
  const { data: bp } = await supabase
    .from('builder_profiles')
    .select('skin_url')
    .eq('user_id', userId)
    .maybeSingle()

  return bp?.skin_url ? { image_url: bp.skin_url, rarity: 'common' } : null
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
