import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { createServiceRoleClient } from '@lib/db'
import { evaluateSchema } from '@lib/taste/schema'
import { getBuilderProfile } from '@lib/taste/queries'
import { createOrResetProfile } from '@lib/taste/mutations'
import { runProfilePipeline } from '@lib/taste/pipeline/run'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json()
    const result = evaluateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 }
      )
    }

    const { userId } = result.data

    // Ensure users can only evaluate their own profile
    if (userId !== user.id) {
      return NextResponse.json(
        { errors: [{ message: 'Forbidden' }] },
        { status: 403 }
      )
    }

    // Reject if evaluation is already in progress
    const existingProfile = await getBuilderProfile(userId)
    if (
      existingProfile &&
      ['pending', 'researching', 'formatting', 'generating_skin'].includes(existingProfile.status)
    ) {
      return NextResponse.json(
        { errors: [{ message: 'Evaluation already in progress' }] },
        { status: 409 }
      )
    }

    // Fetch profile data
    const supabase = createServiceRoleClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, twitter_url, linkedin_url, github_url, website_url, building')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { errors: [{ message: 'Profile not found' }] },
        { status: 404 }
      )
    }

    // Check completeness: name + at least twitter or linkedin
    if (!profile.name || (!profile.twitter_url && !profile.linkedin_url)) {
      return NextResponse.json(
        {
          errors: [
            {
              message:
                'Insufficient data. Need name + at least Twitter or LinkedIn URL.',
            },
          ],
        },
        { status: 400 }
      )
    }

    // Create or reset builder profile
    const builderProfile = await createOrResetProfile({
      userId,
      name: profile.name,
      twitterUrl: profile.twitter_url,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      websiteUrl: profile.website_url,
      building: profile.building,
    })

    // Run pipeline (long-running — this is a Vercel long-duration function)
    runProfilePipeline({
      userId,
      name: profile.name,
      twitterUrl: profile.twitter_url,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      websiteUrl: profile.website_url,
      building: profile.building,
    }).catch((err) => {
      console.error('[taste/evaluate] Pipeline error:', err)
    })

    return NextResponse.json({ id: builderProfile.id, status: 'started' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[taste/evaluate] Error:', message)
    return NextResponse.json(
      { errors: [{ message }] },
      { status: 500 }
    )
  }
}
