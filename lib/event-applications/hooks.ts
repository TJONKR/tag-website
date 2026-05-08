import useSWR from 'swr'

import { fetcher } from '@lib/utils'

import type { EventApplicationCounts, EventApplicationStatus, EventHostApplication } from './types'

interface UseEventHostApplicationsOptions {
  fallbackData?: EventHostApplication[]
  status?: EventApplicationStatus
}

export function useEventHostApplications(options?: UseEventHostApplicationsOptions) {
  const url = options?.status
    ? `/api/event-applications?status=${options.status}`
    : '/api/event-applications'

  const { data, error, isLoading, mutate } = useSWR<EventHostApplication[]>(
    url,
    fetcher,
    {
      fallbackData: options?.fallbackData,
    }
  )

  return {
    applications: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

interface UseEventHostApplicationCountsOptions {
  fallbackData?: EventApplicationCounts
}

export function useEventHostApplicationCounts(
  options?: UseEventHostApplicationCountsOptions
) {
  const { data, error, isLoading, mutate } = useSWR<EventApplicationCounts>(
    '/api/event-applications?counts=true',
    fetcher,
    {
      fallbackData: options?.fallbackData,
    }
  )

  return {
    counts: data ?? { pending: 0, approved: 0, rejected: 0, archived: 0 },
    isLoading,
    error,
    mutate,
  }
}
