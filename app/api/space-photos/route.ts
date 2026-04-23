import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getSpacePhotos } from '@lib/space-photos/queries'
import { uploadSpacePhoto } from '@lib/space-photos/mutations'
import {
  ACCEPTED_SPACE_PHOTO_TYPES,
  MAX_SPACE_PHOTO_BYTES,
} from '@lib/space-photos/schema'

export async function GET() {
  try {
    const photos = await getSpacePhotos()
    return NextResponse.json(photos)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized' }] },
        { status: 401 }
      )
    }

    const form = await req.formData()
    const file = form.get('file')
    const caption = (form.get('caption') as string | null) || null

    if (!(file instanceof File)) {
      return NextResponse.json(
        { errors: [{ message: 'file is required' }] },
        { status: 400 }
      )
    }

    if (!ACCEPTED_SPACE_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_SPACE_PHOTO_TYPES)[number])) {
      return NextResponse.json(
        { errors: [{ message: 'Only JPEG, PNG, or WebP files are allowed' }] },
        { status: 400 }
      )
    }

    if (file.size > MAX_SPACE_PHOTO_BYTES) {
      return NextResponse.json(
        { errors: [{ message: 'File too large (max 5 MB)' }] },
        { status: 400 }
      )
    }

    const photo = await uploadSpacePhoto(file, user.id, caption)

    return NextResponse.json({ success: true, id: photo.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
