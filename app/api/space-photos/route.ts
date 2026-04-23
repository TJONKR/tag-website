import { NextResponse } from 'next/server'
import exifr from 'exifr'

import { getOptionalUser } from '@lib/auth/queries'
import { getSpacePhotos } from '@lib/space-photos/queries'
import { uploadSpacePhoto } from '@lib/space-photos/mutations'
import {
  ACCEPTED_SPACE_PHOTO_TYPES,
  MAX_SPACE_PHOTO_BYTES,
} from '@lib/space-photos/schema'

const extractTakenAt = async (file: File): Promise<string | null> => {
  try {
    const buf = await file.arrayBuffer()
    const parsed = await exifr.parse(buf, { pick: ['DateTimeOriginal', 'CreateDate'] })
    const raw = (parsed?.DateTimeOriginal ?? parsed?.CreateDate) as Date | undefined
    if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString()
  } catch {
    // Not all files have EXIF — fall through.
  }
  // Fallback: use the file's lastModified if present.
  const lm = (file as File).lastModified
  if (lm && Number.isFinite(lm)) return new Date(lm).toISOString()
  return null
}

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
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const form = await req.formData()
    // Accept either a single "file" field or multiple "files" fields so
    // the client can bulk-upload in one request.
    const rawFiles: File[] = []
    const single = form.get('file')
    if (single instanceof File) rawFiles.push(single)
    for (const entry of form.getAll('files')) {
      if (entry instanceof File) rawFiles.push(entry)
    }

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { errors: [{ message: 'At least one file is required' }] },
        { status: 400 }
      )
    }

    const uploaded: string[] = []
    const failed: { name: string; reason: string }[] = []

    for (const file of rawFiles) {
      const type = file.type as (typeof ACCEPTED_SPACE_PHOTO_TYPES)[number]
      if (!ACCEPTED_SPACE_PHOTO_TYPES.includes(type)) {
        failed.push({ name: file.name, reason: 'Unsupported type' })
        continue
      }
      if (file.size > MAX_SPACE_PHOTO_BYTES) {
        failed.push({ name: file.name, reason: 'Too large (max 5 MB)' })
        continue
      }
      try {
        const takenAt = await extractTakenAt(file)
        const photo = await uploadSpacePhoto(file, user.id, { takenAt })
        uploaded.push(photo.id)
      } catch (err) {
        failed.push({
          name: file.name,
          reason: err instanceof Error ? err.message : 'Upload failed',
        })
      }
    }

    return NextResponse.json({ uploaded, failed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
