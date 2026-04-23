import useSWR from 'swr'

import { fetcher } from '@lib/utils'

import type { SpacePhotoWithUrl } from './types'

export function useSpacePhotos(fallbackData?: SpacePhotoWithUrl[]) {
  const { data, error, isLoading, mutate } = useSWR<SpacePhotoWithUrl[]>(
    '/api/space-photos',
    fetcher,
    { fallbackData }
  )

  return {
    photos: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
