import { createServerSupabaseClient } from '@lib/db'

import type { ContactItem, Facility, HouseRule, OpeningHours } from './types'

export async function getFacilities(): Promise<Facility[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, description, icon, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Facility[]
}

export async function getHouseRules(): Promise<HouseRule[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('house_rules')
    .select('id, title, description, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data as HouseRule[]
}

export async function getOpeningHours(): Promise<OpeningHours[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('opening_hours')
    .select('id, day, hours, building, note, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data as OpeningHours[]
}

export async function getContactItems(): Promise<ContactItem[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('contact_items')
    .select('id, title, description, icon, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data as ContactItem[]
}
