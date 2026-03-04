import { z } from 'zod'

export const joinSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  building: z.string().min(1, 'Tell us what you are building'),
  whyTag: z.string().min(1, 'Tell us why TAG'),
  referral: z.string().optional(),
})

export type JoinInput = z.infer<typeof joinSchema>
