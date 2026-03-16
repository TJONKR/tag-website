import useSWR from 'swr'

import { fetcher } from '@lib/utils'

import type { BuilderProfile } from './types'

interface UseBuilderProfileOptions {
  fallbackData?: BuilderProfile | null
}

export function useBuilderProfile(options?: UseBuilderProfileOptions) {
  const { data, error, isLoading, mutate } = useSWR<BuilderProfile | null>(
    '/api/taste/status',
    fetcher,
    {
      fallbackData: options?.fallbackData ?? undefined,
      refreshInterval: (latestData) => {
        const status = latestData?.status
        if (!status) return 0
        if (status === 'complete' || status === 'error') return 0
        return 3000
      },
    }
  )

  return {
    profile: data ?? null,
    isLoading,
    error,
    mutate,
  }
}
