import { z } from 'zod'

export const openLootboxSchema = z.object({
  lootboxId: z.string().optional(),
  eventSlug: z.string().optional(),
})

export const rollLootboxSchema = z.object({
  lootboxId: z.string().min(1, 'lootboxId is required').optional(),
})

export const chooseSkinSchema = z.object({
  lootboxId: z.string().min(1, 'lootboxId is required'),
  styleId: z.string().min(1, 'styleId is required'),
})

export const equipSkinSchema = z.object({
  skinId: z.string().min(1, 'skinId is required'),
})

export const retrySkinSchema = z.object({
  skinId: z.string().min(1, 'skinId is required'),
})
