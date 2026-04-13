import { z } from 'zod'

export const signContractSchema = z.object({
  version: z.string().min(1),
})

export type SignContractInput = z.infer<typeof signContractSchema>

export const contractFieldsSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(200),
  kvk: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'KVK number must be 8 digits'),
  city: z.string().trim().min(1, 'City is required').max(100),
  representativeName: z
    .string()
    .trim()
    .min(1, 'Representative name is required')
    .max(150),
  language: z.enum(['nl', 'en']),
})

export type ContractFieldsInput = z.infer<typeof contractFieldsSchema>

export const reviewClaimSchema = z.object({
  status: z.enum(['approved', 'rejected', 'revoked']),
  notes: z.string().trim().max(1000).optional(),
})

export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>
