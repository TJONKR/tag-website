import { createServerSupabaseClient } from '@lib/db'

import type { Application, ApplicationCounts, ApplicationStatus } from './types'

export const getApplications = async (
  status?: ApplicationStatus
): Promise<Application[]> => {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  return (data as Application[]) ?? []
}

export const getApplicationById = async (
  id: string
): Promise<Application | null> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null

  return data as Application
}

export const getApplicationCounts = async (): Promise<ApplicationCounts> => {
  const supabase = await createServerSupabaseClient()

  const [pending, accepted, rejected] = await Promise.all([
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted'),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected'),
  ])

  return {
    pending: pending.count ?? 0,
    accepted: accepted.count ?? 0,
    rejected: rejected.count ?? 0,
  }
}
