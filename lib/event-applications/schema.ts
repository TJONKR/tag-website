import { z } from 'zod'

export const EVENT_TYPES = [
  'talk',
  'workshop',
  'meetup',
  'hackathon',
  'launch',
  'other',
] as const

const optionalUrl = z.string().url().optional().or(z.literal(''))
const optionalString = z.string().optional().or(z.literal(''))

/**
 * Public form payload. The `website` field is a honeypot — real submissions
 * leave it empty; bots that fill every field get silently dropped.
 * `formLoadedAt` is a client-side millisecond timestamp used to reject
 * instant (sub-3-second) submissions that are almost certainly scripted.
 */
export const eventHostRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Valid email is required').max(320),
  phone: optionalString,
  organization: optionalString,

  eventTitle: z.string().min(1, 'Event title is required').max(200),
  eventType: z.enum(EVENT_TYPES, {
    message: 'Pick an event type',
  }),
  description: z
    .string()
    .min(30, 'Please give us at least a short paragraph (30+ chars)')
    .max(5000),
  expectedAttendees: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(10000)
    .optional()
    .or(z.literal('').transform(() => undefined)),

  proposedDate: optionalString,
  proposedDateFlexible: z.coerce.boolean().optional().default(false),
  durationHours: z
    .coerce
    .number()
    .min(0.5)
    .max(72)
    .optional()
    .or(z.literal('').transform(() => undefined)),

  websiteUrl: optionalUrl,
  socialUrl: optionalUrl,
  referral: optionalString,

  // Spam controls. `website` is a honeypot field and is validated as a free
  // string so the API route can silently drop bot-filled submissions instead
  // of returning a 400 that would tip the bot off.
  website: z.string().optional().default(''),
  formLoadedAt: z.coerce.number().int().nonnegative(),
})

export type EventHostRequestInput = z.infer<typeof eventHostRequestSchema>

export const reviewEventApplicationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'archived']),
  adminNotes: z.string().max(5000).optional().or(z.literal('')),
})

export type ReviewEventApplicationInput = z.infer<
  typeof reviewEventApplicationSchema
>
