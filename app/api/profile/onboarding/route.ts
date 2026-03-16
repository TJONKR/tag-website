import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { createServerSupabaseClient } from '@lib/db'
import { onboardingSchema } from '@lib/onboarding/schema'

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

    const {
      name,
      building,
      whyTag,
      referral,
      linkedinUrl,
      twitterUrl,
      githubUrl,
      websiteUrl,
      instagramUrl,
      password,
    } = result.data

    const supabase = await createServerSupabaseClient()

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name,
        building,
        why_tag: whyTag,
        referral: referral || null,
        linkedin_url: linkedinUrl || null,
        twitter_url: twitterUrl || null,
        github_url: githubUrl || null,
        website_url: websiteUrl || null,
        instagram_url: instagramUrl || null,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (profileError) throw new Error(profileError.message)

    // Set password if provided
    if (password && password.length >= 6) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      })

      if (passwordError) {
        console.error('[onboarding] Password update error:', passwordError)
        // Don't fail the whole request — profile is already saved
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
