import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { Idea, IdeaStatus, IdeaWithAuthor } from './types'

export const getIdeasByUser = async (userId: string): Promise<Idea[]> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data as Idea[]) ?? []
}

export const getAllIdeas = async (status?: IdeaStatus): Promise<IdeaWithAuthor[]> => {
  const service = createServiceRoleClient()

  let query = service
    .from('ideas')
    .select('*, author:profiles!ideas_user_id_fkey(id, name, avatar_url)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query

  if (error) throw new Error(error.message)

  return (data as IdeaWithAuthor[]) ?? []
}

export const getIdeaById = async (id: string): Promise<Idea | null> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null

  return data as Idea
}
