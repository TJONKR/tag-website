import { createServerSupabaseClient } from '@lib/db'

import type { TagEvent } from './types'

const EVENT_COLUMNS = 'id, title, type, description, date_iso, location, created_by'

export async function getUpcomingEvents(): Promise<TagEvent[]> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .gte('date_iso', today)
    .neq('type', 'Internal Event')
    .order('date_iso', { ascending: true })

  if (error) throw new Error(error.message)
  return data as TagEvent[]
}

export async function getPastEvents(): Promise<TagEvent[]> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .lt('date_iso', today)
    .neq('type', 'Internal Event')
    .order('date_iso', { ascending: false })

  if (error) throw new Error(error.message)
  return data as TagEvent[]
}

export async function getAllUpcomingEvents(): Promise<TagEvent[]> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .gte('date_iso', today)
    .order('date_iso', { ascending: true })

  if (error) throw new Error(error.message)
  return data as TagEvent[]
}

export async function getAllPastEvents(): Promise<TagEvent[]> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .lt('date_iso', today)
    .order('date_iso', { ascending: false })

  if (error) throw new Error(error.message)
  return data as TagEvent[]
}
