import { createServerSupabaseClient } from '@lib/db'

import type { EventInput } from './schema'

export const insertEvent = async (data: EventInput, userId: string) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('events').insert({
    title: data.title,
    type: data.type,
    description: data.description,
    date_iso: data.date_iso,
    location: data.location,
    created_by: userId,
  })

  if (error) throw new Error(error.message)
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
