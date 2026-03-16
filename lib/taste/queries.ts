import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { BuilderProfile } from './types'

export async function getBuilderProfile(
  userId: string
): Promise<BuilderProfile | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('builder_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  // Table may not exist yet — return null gracefully
  if (error) return null
  return data as BuilderProfile | null
}

export async function getPublicBuilderProfile(
  userId: string
): Promise<BuilderProfile | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('builder_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'complete')
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as BuilderProfile | null
}
