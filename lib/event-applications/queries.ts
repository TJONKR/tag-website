import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type {
  EventApplicationCounts,
  EventApplicationStatus,
  EventHostApplication,
} from './types'

export const getEventHostApplications = async (
  status?: EventApplicationStatus
): Promise<EventHostApplication[]> => {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('event_host_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  return (data as EventHostApplication[]) ?? []
}

export const getEventHostApplicationById = async (
  id: string
): Promise<EventHostApplication | null> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('event_host_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null

  return data as EventHostApplication
}

export const getEventHostApplicationCounts =
  async (): Promise<EventApplicationCounts> => {
    const supabase = await createServerSupabaseClient()

    const [pending, approved, rejected, archived] = await Promise.all([
      supabase
        .from('event_host_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('event_host_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase
        .from('event_host_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected'),
      supabase
        .from('event_host_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'archived'),
    ])

    return {
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      rejected: rejected.count ?? 0,
      archived: archived.count ?? 0,
    }
  }

/**
 * Returns the number of submissions matching an ip_hash inside a time window.
 * Uses the service-role client because the public insert path runs before
 * we have an authenticated session.
 */
export const countRecentSubmissionsByIpHash = async (
  ipHash: string,
  sinceIso: string
): Promise<number> => {
  const service = createServiceRoleClient()

  const { count, error } = await service
    .from('event_host_applications')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', sinceIso)

  if (error) {
    console.error('[event-applications] countRecentSubmissionsByIpHash', error.message)
    return 0
  }

  return count ?? 0
}
