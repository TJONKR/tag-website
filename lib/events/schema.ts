import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['Event', 'Internal Event', 'Hackathon']),
  description: z.string().min(1, 'Description is required'),
  date_iso: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
})

export type EventInput = z.infer<typeof eventSchema>
