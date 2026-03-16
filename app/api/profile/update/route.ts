import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getOptionalUser } from '@lib/auth/queries'
import { createServerSupabaseClient } from '@lib/db'

const profileUpdateSchema = z.object({
  building: z.string().min(1, 'Tell us what you are building').optional(),
  whyTag: z.string().min(1, 'Tell us why TAG').optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
})

export async function PATCH(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json()
    const result = profileUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    const { building, whyTag, linkedinUrl, twitterUrl, githubUrl, websiteUrl, instagramUrl } =
      result.data

    const supabase = await createServerSupabaseClient()

    const updateData: Record<string, string | null> = {}
    if (building !== undefined) updateData.building = building
    if (whyTag !== undefined) updateData.why_tag = whyTag
    if (linkedinUrl !== undefined) updateData.linkedin_url = linkedinUrl || null
    if (twitterUrl !== undefined) updateData.twitter_url = twitterUrl || null
    if (githubUrl !== undefined) updateData.github_url = githubUrl || null
    if (websiteUrl !== undefined) updateData.website_url = websiteUrl || null
    if (instagramUrl !== undefined) updateData.instagram_url = instagramUrl || null

    const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
