import { createServerSupabaseClient } from '@lib/db'

import type { OnboardingProfile } from './types'

export const getOnboardingProfile = async (
  userId: string
): Promise<OnboardingProfile> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'name, building, why_tag, referral, linkedin_url, twitter_url, github_url, website_url, instagram_url'
    )
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)

  return data as OnboardingProfile
}
