import { z } from 'zod'

export const ideaCategoryEnum = z.enum(['event', 'feature', 'community', 'other'])
export const ideaStatusEnum = z.enum(['new', 'in_review', 'planned', 'done', 'rejected'])

export const createIdeaSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  body: z.string().trim().min(1, 'Description is required').max(4000),
  category: ideaCategoryEnum,
})

export const updateIdeaStatusSchema = z.object({
  status: ideaStatusEnum,
  admin_note: z.string().max(2000).nullable().optional(),
})

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>
export type UpdateIdeaStatusInput = z.infer<typeof updateIdeaStatusSchema>
