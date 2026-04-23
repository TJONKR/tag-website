import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'

import { getOptionalUser } from '@lib/auth/queries'
import { createServiceRoleClient } from '@lib/db'
import { getBuilderProfile } from '@lib/taste/queries'
import { createOrResetProfile } from '@lib/taste/mutations'
import { runProfilePipeline } from '@lib/taste/pipeline/run'

// Idempotently start (or skip) the taste pipeline for the current user.
// Called from the onboarding flow on mount so the builder profile is
// ready by the time they land on the prophecy step. Safe to call many
// times: already-complete or in-progress profiles are no-ops.
export const maxDuration = 300

export async function POST() {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const existing = await getBuilderProfile(user.id)
    if (existing) {
      return NextResponse.json({ status: existing.status, skipped: true })
    }

    const supabase = createServiceRoleClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, twitter_url, linkedin_url, github_url, website_url, building')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.name || (!profile.twitter_url && !profile.linkedin_url)) {
      return NextResponse.json({ status: 'insufficient_data' })
    }

    await createOrResetProfile({
      userId: user.id,
      name: profile.name,
      twitterUrl: profile.twitter_url,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      websiteUrl: profile.website_url,
      building: profile.building,
    })

    waitUntil(
      runProfilePipeline({
        userId: user.id,
        name: profile.name,
        twitterUrl: profile.twitter_url,
        linkedinUrl: profile.linkedin_url,
        githubUrl: profile.github_url,
        websiteUrl: profile.website_url,
        building: profile.building,
      }).catch((err) => console.error('[taste/ensure] pipeline failed:', err))
    )

    return NextResponse.json({ status: 'started' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
