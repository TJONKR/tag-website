import { createServerSupabaseClient } from '@lib/db'
import { getUserEmail, sendWelcomeAmbassador } from '@lib/email/senders'

import type { OnboardingInput } from './schema'

export async function completeOnboarding(userId: string, input: OnboardingInput) {
  const supabase = await createServerSupabaseClient()

  // Check if this is the transition from in-progress to completed, so we
  // only send the welcome mail once.
  const { data: existing } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single()

  const wasCompleted = Boolean(existing?.onboarding_completed)

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

  if (!wasCompleted) {
    const email = await getUserEmail(userId)
    if (email) {
      await sendWelcomeAmbassador({ to: email, name: input.name })
    }
  }
}
