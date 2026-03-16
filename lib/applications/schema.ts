import { z } from 'zod'

export const reviewApplicationSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
})

export const directInviteSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Name is required').optional(),
})

export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>
export type DirectInviteInput = z.infer<typeof directInviteSchema>
