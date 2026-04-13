import useSWR from 'swr'

import { fetcher } from '@lib/utils'

import type { AvatarJob } from './types'

interface UseAvatarStatusOptions {
  jobId: string | null
}

export function useAvatarStatus({ jobId }: UseAvatarStatusOptions) {
  const { data, error, isLoading, mutate } = useSWR<AvatarJob | null>(
    jobId ? `/api/avatar/status?jobId=${jobId}` : null,
    fetcher,
    {
      refreshInterval: (latestData) => {
        if (!latestData) return 3000
        if (latestData.status === 'complete' || latestData.status === 'error') return 0
        return 3000
      },
    }
  )

  return {
    job: data ?? null,
    isLoading,
    error,
    mutate,
  }
}
