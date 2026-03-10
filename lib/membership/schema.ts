import { z } from 'zod'

export const signContractSchema = z.object({
  version: z.string().min(1),
})

export type SignContractInput = z.infer<typeof signContractSchema>
