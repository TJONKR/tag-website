import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { uploadUserPhoto, deleteUserPhoto } from '@lib/photos/mutations'
import { getUserPhotos } from '@lib/photos/queries'
import { MAX_PHOTOS, MAX_PHOTO_SIZE } from '@lib/photos/types'

export async function GET() {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const photos = await getUserPhotos(user.id)
    return NextResponse.json(photos)
  } catch (error) {
    console.error('[photos GET]', error)
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('photo') as File
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_PHOTO_SIZE) {
      return NextResponse.json({ error: 'File must be under 2MB' }, { status: 400 })
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP are allowed' }, { status: 400 })
    }

    const photos = await getUserPhotos(user.id)
    if (photos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      )
    }

    const result = await uploadUserPhoto(user.id, file)
    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    console.error('[photos POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoId } = await req.json()
    if (!photoId) {
      return NextResponse.json({ error: 'Missing photoId' }, { status: 400 })
    }

    await deleteUserPhoto(user.id, photoId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    console.error('[photos DELETE]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
