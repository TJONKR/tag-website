import { createServerSupabaseClient } from '@lib/db'

import type { ContactItemInput, FacilityInput, GuidelineInput, OpeningHoursInput } from './schema'

// Facilities
export const insertFacility = async (data: FacilityInput) => {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase.from('facilities').insert(data).select().single()
  if (error) throw new Error(error.message)
  return row
}

export const updateFacility = async (id: string, data: FacilityInput) => {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('facilities')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return row
}

export const deleteFacility = async (id: string) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('facilities').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const reorderFacilities = async (ids: string[]) => {
  const supabase = await createServerSupabaseClient()
  const updates = ids.map((id, index) =>
    supabase.from('facilities').update({ sort_order: index }).eq('id', id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

// Guidelines
export const insertGuideline = async (data: GuidelineInput) => {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase.from('guidelines').insert(data).select().single()
  if (error) throw new Error(error.message)
  return row
}

export const updateGuideline = async (id: string, data: GuidelineInput) => {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('guidelines')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return row
}

export const deleteGuideline = async (id: string) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('guidelines').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const reorderGuidelines = async (ids: string[]) => {
  const supabase = await createServerSupabaseClient()
  const updates = ids.map((id, index) =>
    supabase.from('guidelines').update({ sort_order: index }).eq('id', id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

// Opening Hours
export const insertOpeningHours = async (data: OpeningHoursInput) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('opening_hours').insert(data)
  if (error) throw new Error(error.message)
}

export const updateOpeningHours = async (id: string, data: OpeningHoursInput) => {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('opening_hours')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return row
}

export const deleteOpeningHours = async (id: string) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('opening_hours').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Contact Items
export const insertContactItem = async (data: ContactItemInput) => {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase.from('contact_items').insert(data).select().single()
  if (error) throw new Error(error.message)
  return row
}

export const updateContactItem = async (id: string, data: ContactItemInput) => {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('contact_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return row
}

export const deleteContactItem = async (id: string) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('contact_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const reorderContactItems = async (ids: string[]) => {
  const supabase = await createServerSupabaseClient()
  const updates = ids.map((id, index) =>
    supabase.from('contact_items').update({ sort_order: index }).eq('id', id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}
