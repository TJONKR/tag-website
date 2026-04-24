import { createServerSupabaseClient } from '@lib/db'

import type { OnboardingInput } from './schema'

export async function finishOnboarding(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single()

  if (existing?.onboarding_completed) return

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

export async function resetOnboarding(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: false })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

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
}
