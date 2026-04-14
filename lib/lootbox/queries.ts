import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { LootboxEvent, LootboxStyle, UserLootbox, UserSkin } from './types'

export async function getLootboxEvent(slug: string): Promise<LootboxEvent | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('lootbox_events')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error) return null
  return data as LootboxEvent | null
}

export async function getEventStyles(eventId: string): Promise<LootboxStyle[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('lootbox_styles')
    .select('*')
    .or(`event_id.eq.${eventId},event_id.is.null`)

  if (error) return []
  return data as LootboxStyle[]
}

export async function getGlobalStyles(): Promise<LootboxStyle[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('lootbox_styles')
    .select('*')
    .is('event_id', null)

  if (error) return []
  return data as LootboxStyle[]
}

export async function getUserLootboxes(userId: string): Promise<UserLootbox[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_lootboxes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as UserLootbox[]
}

/**
 * Count of unopened lootboxes available to a user.
 * Used for the LOOTBOXES stat on the profile page.
 */
export async function getAvailableLootboxCount(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const { count, error } = await supabase
    .from('user_lootboxes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'available')

  if (error) return 0
  return count ?? 0
}

/**
 * The oldest unopened lootbox for a user (FIFO open order).
 */
export async function getNextAvailableLootbox(
  userId: string
): Promise<UserLootbox | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_lootboxes')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'available')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as UserLootbox | null
}

export async function getUserLootbox(lootboxId: string): Promise<UserLootbox | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_lootboxes')
    .select('*')
    .eq('id', lootboxId)
    .maybeSingle()

  if (error) return null
  return data as UserLootbox | null
}

export async function getUserSkins(userId: string): Promise<UserSkin[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_skins')
    .select('*, style:lootbox_styles(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as UserSkin[]
}

export async function getEquippedSkin(userId: string): Promise<UserSkin | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_skins')
    .select('*, style:lootbox_styles(*)')
    .eq('user_id', userId)
    .eq('equipped', true)
    .maybeSingle()

  if (error) return null
  return data as UserSkin | null
}

export async function getPendingSkin(userId: string): Promise<UserSkin | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_skins')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['generating', 'error'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as UserSkin | null
}

export async function getSkinById(skinId: string): Promise<UserSkin | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('user_skins')
    .select('*, style:lootbox_styles(*)')
    .eq('id', skinId)
    .maybeSingle()

  if (error) return null
  return data as UserSkin | null
}
