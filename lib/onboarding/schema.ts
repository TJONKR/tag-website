import { z } from 'zod'

export const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  building: z.string().min(1, 'Tell us what you are building'),
  whyTag: z.string().min(1, 'Tell us why TAG'),
  referral: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
