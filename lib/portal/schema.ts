import { z } from 'zod'

export const facilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  sort_order: z.number().int().default(0),
})

export type FacilityInput = z.infer<typeof facilitySchema>

export const houseRuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  sort_order: z.number().int().default(0),
})

export type HouseRuleInput = z.infer<typeof houseRuleSchema>

export const openingHoursSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  hours: z.string(),
  building: z.string(),
  note: z.string().nullable().default(null),
  sort_order: z.number().int().default(0),
})

export type OpeningHoursInput = z.infer<typeof openingHoursSchema>

export const contactItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  sort_order: z.number().int().default(0),
})

export type ContactItemInput = z.infer<typeof contactItemSchema>
