import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'

import { getOptionalUser } from '@lib/auth/queries'
import { onboardingSchema } from '@lib/onboarding/schema'
import { completeOnboarding } from '@lib/onboarding/mutations'
import { createOrResetProfile } from '@lib/taste/mutations'
import { hasBuilderProfile } from '@lib/taste/queries'
import { runProfilePipeline } from '@lib/taste/pipeline/run'

// Keep the function alive for the taste pipeline; it runs in waitUntil and can
// take a few minutes (Anthropic + Apify).
export const maxDuration = 300

export async function PATCH(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json()
    const result = onboardingSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    const input = result.data
    await completeOnboarding(user.id, input)

    // Fire the taste pipeline once per user when onboarding gives us enough to
    // work with. The hasBuilderProfile guard means later onboarding edits
    // don't re-burn Anthropic/Apify credit. Manual reruns via /portal/taste
    // bypass this (they go through createOrResetProfile directly).
    const hasMinimumData =
      Boolean(input.name) && Boolean(input.linkedinUrl || input.twitterUrl)

    if (hasMinimumData && !(await hasBuilderProfile(user.id))) {
      await createOrResetProfile({
        userId: user.id,
        name: input.name,
        twitterUrl: input.twitterUrl,
        linkedinUrl: input.linkedinUrl,
        githubUrl: input.githubUrl,
        websiteUrl: input.websiteUrl,
        building: input.building,
      })

      waitUntil(
        runProfilePipeline({
          userId: user.id,
          name: input.name,
          twitterUrl: input.twitterUrl,
          linkedinUrl: input.linkedinUrl,
          githubUrl: input.githubUrl,
          websiteUrl: input.websiteUrl,
          building: input.building,
        }).catch((err) => {
          console.error('[onboarding] taste auto-eval failed:', err)
        })
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
