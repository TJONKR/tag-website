import { createServerSupabaseClient } from '@lib/db'

import type { OnboardingInput } from './schema'

export async function completeOnboarding(userId: string, input: OnboardingInput) {
  const supabase = await createServerSupabaseClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: input.name,
      building: input.building,
      why_tag: input.whyTag,
      referral: input.referral || null,
      linkedin_url: input.linkedinUrl || null,
      twitter_url: input.twitterUrl || null,
      github_url: input.githubUrl || null,
      website_url: input.websiteUrl || null,
      instagram_url: input.instagramUrl || null,
      onboarding_completed: true,
    })
    .eq('id', userId)

  if (profileError) throw new Error(profileError.message)

  // Set password if provided
  if (input.password && input.password.length >= 6) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: input.password,
    })

    if (passwordError) {
      console.error('[onboarding] Password update error:', passwordError)
      // Don't fail the whole request — profile is already saved
    }
  }
}
