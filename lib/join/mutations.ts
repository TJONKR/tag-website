import { createServerSupabaseClient } from '@lib/db'

import type { JoinInput } from './schema'

export const insertApplication = async (data: JoinInput) => {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('applications').insert({
    name: data.name,
    email: data.email,
    building: data.building,
    why_tag: data.whyTag,
    referral: data.referral || null,
    linkedin_url: data.linkedinUrl || null,
    twitter_url: data.twitterUrl || null,
    github_url: data.githubUrl || null,
    website_url: data.websiteUrl || null,
    instagram_url: data.instagramUrl || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}
