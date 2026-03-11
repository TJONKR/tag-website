import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const registerSchema = z.object({
  // Step 1: Account
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Step 2: About you
  building: z.string().min(1, 'Tell us what you are building'),
  whyTag: z.string().min(1, 'Tell us why TAG'),
  referral: z.string().optional(),
  // Step 3: Socials (all optional)
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
})

export type RegisterInput = z.infer<typeof registerSchema>
