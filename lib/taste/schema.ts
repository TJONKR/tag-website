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

// Edit of AI-generated fields (self-only).
// All fields optional — caller sends only what changed.
const projectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  url: z.string().url().optional().or(z.literal('')),
  role: z.string().max(80).optional().or(z.literal('')),
})

const keyLinkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(120),
  type: z.string().min(1).max(40),
})

export const tasteProfileUpdateSchema = z.object({
  headline: z.string().max(200).optional(),
  bio: z.string().max(4000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  projects: z.array(projectSchema).max(20).optional(),
  interests: z.array(z.string().min(1).max(60)).max(30).optional(),
  notable_work: z.array(z.string().min(1).max(200)).max(20).optional(),
  influences: z.array(z.string().min(1).max(60)).max(30).optional(),
  key_links: z.array(keyLinkSchema).max(20).optional(),
})

export type TasteProfileUpdateInput = z.infer<typeof tasteProfileUpdateSchema>
