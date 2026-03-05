import { createServerSupabaseClient } from '@lib/db'

import type { JoinInput } from './schema'

export const insertApplication = async (data: JoinInput) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('applications').insert({
    name: data.name,
    email: data.email,
    building: data.building,
    why_tag: data.whyTag,
    referral: data.referral || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}
