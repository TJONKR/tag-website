import { z } from 'zod'

export const updateSpacePhotoSchema = z.object({
  caption: z.string().max(200).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})

export const reorderSpacePhotosSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
})

export type UpdateSpacePhotoInput = z.infer<typeof updateSpacePhotoSchema>
export type ReorderSpacePhotosInput = z.infer<typeof reorderSpacePhotosSchema>

export const MAX_SPACE_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB
export const ACCEPTED_SPACE_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const
