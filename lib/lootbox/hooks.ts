import useSWR from 'swr'

import { fetcher } from '@lib/utils'

import type { UserLootbox, UserSkin } from './types'

interface UseLootboxOptions {
  fallbackData?: UserLootbox[]
}

export function useLootboxes(options?: UseLootboxOptions) {
  const { data, error, isLoading, mutate } = useSWR<UserLootbox[]>(
    '/api/lootbox/list',
    fetcher,
    {
      fallbackData: options?.fallbackData ?? undefined,
    }
  )

  return {
    lootboxes: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

interface UseSkinStatusOptions {
  skinId: string | null
}

export function useSkinStatus({ skinId }: UseSkinStatusOptions) {
  const { data, error, isLoading, mutate } = useSWR<UserSkin | null>(
    skinId ? `/api/lootbox/status?skinId=${skinId}` : null,
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
    skin: data ?? null,
    isLoading,
    error,
    mutate,
  }
}

interface UseSkinsOptions {
  fallbackData?: UserSkin[]
}

export function useSkins(options?: UseSkinsOptions) {
  const { data, error, isLoading, mutate } = useSWR<UserSkin[]>(
    '/api/lootbox/skins',
    fetcher,
    {
      fallbackData: options?.fallbackData ?? undefined,
    }
  )

  return {
    skins: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
