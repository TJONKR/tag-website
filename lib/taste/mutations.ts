import { createServiceRoleClient } from '@lib/db'
import { getUserEmail, sendTasteComplete, sendTasteFailed } from '@lib/email/senders'

import type { ProfileStatus, VisibilityField } from './types'

async function notifyBuilderProfileStatus(
  userId: string,
  status: 'complete' | 'error',
  errorMessage?: string
) {
  const email = await getUserEmail(userId)
  if (!email) return

  const supabase = createServiceRoleClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()
  const name = profile?.name ?? undefined

  if (status === 'complete') {
    await sendTasteComplete({ to: email, name })
  } else {
    await sendTasteFailed({ to: email, name, errorMessage })
  }
}

interface CreateProfileInput {
  userId: string
  name: string
  twitterUrl?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  websiteUrl?: string | null
  building?: string | null
}

export async function createOrResetProfile(input: CreateProfileInput) {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('builder_profiles')
    .upsert(
      {
        user_id: input.userId,
        status: 'pending' as ProfileStatus,
        status_message: null,
        error: null,
        input_name: input.name,
        input_twitter: input.twitterUrl || null,
        input_linkedin: input.linkedinUrl || null,
        input_github: input.githubUrl || null,
        input_website: input.websiteUrl || null,
        input_building: input.building || null,
        headline: null,
        bio: null,
        tags: null,
        projects: null,
        interests: null,
        notable_work: null,
        influences: null,
        key_links: null,
        avatar_url: null,
        data_sources: null,
        skin_url: null,
        completed_at: null,
      },
      { onConflict: 'user_id' }
    )
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateEvaluationStatus(
  userId: string,
  status: ProfileStatus,
  statusMessage?: string
) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('builder_profiles')
    .update({
      status,
      status_message: statusMessage || null,
    })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

interface SaveProfileResultInput {
  headline: string
  bio: string
  tags: string[]
  projects: { name: string; description: string; url?: string; role?: string }[]
  interests: string[]
  notableWork: string[]
  influences: string[]
  keyLinks: { url: string; title: string; type: string }[]
  dataSources: string[]
  avatarUrl: string
}

export async function saveProfileResult(
  userId: string,
  result: SaveProfileResultInput
) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('builder_profiles')
    .update({
      status: 'complete' as ProfileStatus,
      headline: result.headline,
      bio: result.bio,
      tags: result.tags,
      projects: result.projects,
      interests: result.interests,
      notable_work: result.notableWork,
      influences: result.influences,
      key_links: result.keyLinks,
      data_sources: result.dataSources,
      avatar_url: result.avatarUrl,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  await notifyBuilderProfileStatus(userId, 'complete')
}

export async function setEvaluationError(userId: string, errorMessage: string) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('builder_profiles')
    .update({
      status: 'error' as ProfileStatus,
      error: errorMessage,
    })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  await notifyBuilderProfileStatus(userId, 'error', errorMessage)
}

export async function updateVisibility(
  userId: string,
  field: VisibilityField,
  value: boolean
) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('builder_profiles')
    .update({ [field]: value })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

interface TasteFieldsPatch {
  headline?: string
  bio?: string
  tags?: string[]
  projects?: { name: string; description: string; url?: string; role?: string }[]
  interests?: string[]
  notable_work?: string[]
  influences?: string[]
  key_links?: { url: string; title: string; type: string }[]
}

export async function updateTasteFields(userId: string, patch: TasteFieldsPatch) {
  const supabase = createServiceRoleClient()

  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    cleaned[key] = value
  }
  if (Object.keys(cleaned).length === 0) return

  const { error } = await supabase
    .from('builder_profiles')
    .update(cleaned)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}
