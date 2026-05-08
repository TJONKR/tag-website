import { z } from 'zod'

export const ideaCategoryEnum = z.enum(['event', 'feature', 'community', 'other'])
export const ideaStatusEnum = z.enum(['new', 'in_review', 'planned', 'done', 'rejected'])

export const createIdeaSchema = z.object({
  body: z.string().trim().min(1, 'Tell us your idea').max(4000),
})

export const updateIdeaStatusSchema = z.object({
  status: ideaStatusEnum,
  admin_note: z.string().max(2000).nullable().optional(),
})

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>
export type UpdateIdeaStatusInput = z.infer<typeof updateIdeaStatusSchema>
