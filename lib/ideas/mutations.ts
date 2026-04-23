import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { CreateIdeaInput, UpdateIdeaStatusInput } from './schema'
import type { Idea } from './types'

export const createIdea = async (userId: string, input: CreateIdeaInput): Promise<Idea> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      user_id: userId,
      title: input.title,
      body: input.body,
      category: input.category,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as Idea
}

export const updateIdeaStatus = async (id: string, input: UpdateIdeaStatusInput) => {
  const service = createServiceRoleClient()

  const { error } = await service
    .from('ideas')
    .update({
      status: input.status,
      admin_note: input.admin_note ?? null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
