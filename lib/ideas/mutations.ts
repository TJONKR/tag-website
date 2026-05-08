import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { CreateIdeaInput, UpdateIdeaStatusInput } from './schema'
import type { Idea } from './types'

export const createIdea = async (userId: string, input: CreateIdeaInput): Promise<Idea> => {
  const supabase = await createServerSupabaseClient()

  // The DB still requires title + category (NOT NULL). We derive the
  // title from the first line of the body (up to 120 chars) and default
  // the category to 'other' — the UI no longer asks for either.
  const firstLine = input.body.split(/\r?\n/)[0]?.trim() ?? ''
  const title = (firstLine.length > 0 ? firstLine : input.body.trim()).slice(0, 120)

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      user_id: userId,
      title,
      body: input.body,
      category: 'other',
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
