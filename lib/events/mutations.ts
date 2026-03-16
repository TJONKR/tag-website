import { createServerSupabaseClient } from '@lib/db'

import type { EventInput } from './schema'

export const insertEvent = async (data: EventInput, userId: string) => {
  const supabase = await createServerSupabaseClient()

  const { data: inserted, error } = await supabase
    .from('events')
    .insert({
      title: data.title,
      type: data.type,
      description: data.description,
      date_iso: data.date_iso,
      location: data.location,
      created_by: userId,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return inserted.id as string
}

export const updateEvent = async (id: string, data: EventInput) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('events')
    .update({
      title: data.title,
      type: data.type,
      description: data.description,
      date_iso: data.date_iso,
      location: data.location,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export const deleteEvent = async (id: string) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

export const addAttendance = async (eventId: string, userId: string) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('event_attendance')
    .insert({ event_id: eventId, user_id: userId })

  if (error) throw new Error(error.message)
}

export const removeAttendance = async (eventId: string, userId: string) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('event_attendance')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export const upsertAttendanceFromLuma = async (params: {
  eventId: string
  userId: string
  checkedInAt: string | null
  lumaGuestId: string
  lumaApprovalStatus: string
  registeredAt: string
}) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('event_attendance').upsert(
    {
      event_id: params.eventId,
      user_id: params.userId,
      checked_in_at: params.checkedInAt,
      luma_guest_id: params.lumaGuestId,
      luma_approval_status: params.lumaApprovalStatus,
      registered_at: params.registeredAt,
      source: 'luma',
    },
    { onConflict: 'event_id,user_id' }
  )

  if (error) throw new Error(error.message)
}

export const updateEventLumaFields = async (
  id: string,
  fields: {
    luma_event_id?: string
    luma_url?: string
    start_at?: string
    end_at?: string
    cover_url?: string
  }
) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('events').update(fields).eq('id', id)

  if (error) throw new Error(error.message)
}
