import { createServerSupabaseClient } from '@lib/db'

import type { FacilityInput, HouseRuleInput, OpeningHoursInput } from './schema'

// Facilities
export const insertFacility = async (data: FacilityInput) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('facilities').insert(data)
  if (error) throw new Error(error.message)
}

export const updateFacility = async (id: string, data: FacilityInput) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('facilities').update(data).eq('id', id)
  if (error) throw new Error(error.message)
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

// House Rules
export const insertHouseRule = async (data: HouseRuleInput) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('house_rules').insert(data)
  if (error) throw new Error(error.message)
}

export const updateHouseRule = async (id: string, data: HouseRuleInput) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('house_rules').update(data).eq('id', id)
  if (error) throw new Error(error.message)
}

export const deleteHouseRule = async (id: string) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('house_rules').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const reorderHouseRules = async (ids: string[]) => {
  const supabase = await createServerSupabaseClient()
  const updates = ids.map((id, index) =>
    supabase.from('house_rules').update({ sort_order: index }).eq('id', id)
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
  const { error } = await supabase.from('opening_hours').update(data).eq('id', id)
  if (error) throw new Error(error.message)
}

export const deleteOpeningHours = async (id: string) => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('opening_hours').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
