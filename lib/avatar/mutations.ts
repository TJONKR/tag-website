import { createServiceRoleClient } from '@lib/db'

import type { AvatarJob } from './types'

export const AVATAR_PROMPT =
  'Create a clean, professional portrait avatar based on this reference photo. Keep the likeness accurate. Simple background, good lighting, slightly stylized.'

/**
 * Create a new avatar generation job.
 */
export async function createAvatarJob(userId: string): Promise<AvatarJob> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('avatar_jobs')
    .insert({
      user_id: userId,
      status: 'generating',
      prompt: AVATAR_PROMPT,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as AvatarJob
}

/**
 * Update an avatar job's status and optionally set the image URL.
 */
export async function updateAvatarJob(
  jobId: string,
  status: AvatarJob['status'],
  imageUrl?: string
) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('avatar_jobs')
    .update({
      status,
      ...(imageUrl && { image_url: imageUrl }),
    })
    .eq('id', jobId)

  if (error) throw new Error(error.message)
}

/**
 * Get an avatar job by ID.
 */
export async function getAvatarJob(jobId: string): Promise<AvatarJob | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('avatar_jobs')
    .select()
    .eq('id', jobId)
    .single()

  if (error) return null
  return data as AvatarJob
}

/**
 * Confirm an avatar job: copy generated image URL to profiles.avatar_url.
 */
export async function confirmAvatar(userId: string, jobId: string) {
  const supabase = createServiceRoleClient()

  // Verify job belongs to user and is complete
  const { data: job, error: jobError } = await supabase
    .from('avatar_jobs')
    .select('image_url, status')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single()

  if (jobError || !job) throw new Error('Avatar job not found')
  if (job.status !== 'complete') throw new Error('Avatar job not complete')
  if (!job.image_url) throw new Error('No image URL on completed job')

  // Update profile avatar
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: job.image_url })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}
