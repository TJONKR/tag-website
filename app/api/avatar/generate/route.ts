import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getUserPhotos } from '@lib/photos/queries'
import { MAX_PHOTOS } from '@lib/photos/types'
import { createAvatarJob, updateAvatarJob, AVATAR_PROMPT } from '@lib/avatar/mutations'
import { generate2dImage } from '@lib/ai/generate-image'
import { createServiceRoleClient } from '@lib/db'

export async function POST() {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate user has enough photos
    const photos = await getUserPhotos(user.id)
    if (photos.length < MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Upload at least ${MAX_PHOTOS} reference photos first` },
        { status: 400 }
      )
    }

    // Create job record
    const job = await createAvatarJob(user.id)

    // Get signed URL for the first photo
    const supabase = createServiceRoleClient()
    const { data: signedUrl } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(photos[0].storage_path, 3600)

    if (!signedUrl?.signedUrl) {
      await updateAvatarJob(job.id, 'error')
      return NextResponse.json({ error: 'Failed to access reference photo' }, { status: 500 })
    }

    // Fire-and-forget generation
    generate2dImage(signedUrl.signedUrl, AVATAR_PROMPT)
      .then(async (imageUrl) => {
        await updateAvatarJob(job.id, 'complete', imageUrl)
      })
      .catch(async (err) => {
        console.error('[avatar/generate] Pipeline error:', err)
        await updateAvatarJob(job.id, 'error')
      })

    return NextResponse.json({ jobId: job.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start avatar generation'
    console.error('[avatar/generate POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
