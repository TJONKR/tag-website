import { z } from 'zod'

export const evaluateSchema = z.object({
  userId: z.string().uuid('Valid user ID is required'),
})

export type EvaluateInput = z.infer<typeof evaluateSchema>

const VISIBILITY_FIELDS = [
  'show_headline',
  'show_bio',
  'show_tags',
  'show_projects',
  'show_interests',
  'show_notable_work',
  'show_influences',
  'show_key_links',
] as const

export const visibilityUpdateSchema = z.object({
  field: z.enum(VISIBILITY_FIELDS),
  value: z.boolean(),
})

export type VisibilityUpdateInput = z.infer<typeof visibilityUpdateSchema>
