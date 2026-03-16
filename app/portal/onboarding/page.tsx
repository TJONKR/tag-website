import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'
import { getOnboardingProfile } from '@lib/onboarding/queries'
import { OnboardingForm } from '@lib/onboarding/components'

export default async function OnboardingPage() {
  const user = await getUser()

  // Check if onboarding is already completed
  const { createServerSupabaseClient } = await import('@lib/db')
  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/portal/events')
  }

  const onboardingProfile = await getOnboardingProfile(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syne text-2xl font-bold text-tag-text">
          Welcome to TAG
        </h1>
        <p className="mt-1 font-grotesk text-sm text-tag-muted">
          Complete your profile to get started.
        </p>
      </div>
      <OnboardingForm profile={onboardingProfile} />
    </div>
  )
}
