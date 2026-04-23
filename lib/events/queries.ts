import { createServerSupabaseClient } from '@lib/db'

import type { TagEvent, EventAttendee } from './types'

const EVENT_COLUMNS =
  'id, title, type, description, date_iso, location, created_by, luma_event_id, luma_url, start_at, end_at, cover_url, is_externally_managed, external_host'

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

export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('event_attendance')
    .select('user_id, checked_in_at, luma_approval_status, registered_at, source, profiles(name)')
    .eq('event_id', eventId)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { name: string | null } | null
    return {
      user_id: row.user_id,
      name: profile?.name ?? null,
      checked_in_at: row.checked_in_at ?? null,
      luma_approval_status: row.luma_approval_status ?? null,
      registered_at: row.registered_at ?? null,
      source: row.source ?? 'manual',
    }
  })
}

export async function getUserAttendedEvents(
  userId: string
): Promise<{ id: string; title: string; date_iso: string; checked_in_at: string | null }[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('event_attendance')
    .select('event_id, checked_in_at, events(id, title, date_iso)')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  return (data ?? [])
    .map((row) => {
      const event = row.events as unknown as {
        id: string
        title: string
        date_iso: string
      } | null
      return event
        ? {
            id: event.id,
            title: event.title,
            date_iso: event.date_iso,
            checked_in_at: row.checked_in_at ?? null,
          }
        : null
    })
    .filter(
      (
        e
      ): e is {
        id: string
        title: string
        date_iso: string
        checked_in_at: string | null
      } => e !== null
    )
    .sort((a, b) => b.date_iso.localeCompare(a.date_iso))
}

export async function getUserAttendanceCount(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const { count, error } = await supabase
    .from('event_attendance')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getUserCheckedInCount(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const { count, error } = await supabase
    .from('event_attendance')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('checked_in_at', 'is', null)

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getEventAttendanceSummary(
  eventId: string
): Promise<{ total: number; checkedIn: number }> {
  const supabase = await createServerSupabaseClient()

  const { count: total, error: totalError } = await supabase
    .from('event_attendance')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if (totalError) throw new Error(totalError.message)

  const { count: checkedIn, error: checkedInError } = await supabase
    .from('event_attendance')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .not('checked_in_at', 'is', null)

  if (checkedInError) throw new Error(checkedInError.message)

  return { total: total ?? 0, checkedIn: checkedIn ?? 0 }
}
