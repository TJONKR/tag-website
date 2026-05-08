import useSWR from 'swr'

import { fetcher } from '@lib/utils'

import type { Idea, IdeaStatus, IdeaWithAuthor } from './types'

export function useMyIdeas(fallbackData?: Idea[]) {
  const { data, error, isLoading, mutate } = useSWR<Idea[]>('/api/ideas/mine', fetcher, {
    fallbackData,
  })

  return {
    ideas: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

export function useAdminIdeas(status?: IdeaStatus, fallbackData?: IdeaWithAuthor[]) {
  const key = status ? `/api/admin/ideas?status=${status}` : '/api/admin/ideas'

  const { data, error, isLoading, mutate } = useSWR<IdeaWithAuthor[]>(key, fetcher, {
    fallbackData,
  })

  return {
    ideas: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
