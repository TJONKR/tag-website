import JSZip from 'jszip'

import { getSpacePhotos } from '@lib/space-photos/queries'

const sanitizeCaption = (caption: string | null | undefined, index: number) => {
  const base = (caption ?? `tag-space-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
  return base || `tag-space-${index + 1}`
}

const extensionFromPath = (path: string) => {
  const match = path.toLowerCase().match(/\.(jpe?g|png|webp)$/)
  return match ? match[0] : '.jpg'
}

export async function GET() {
  try {
    const photos = await getSpacePhotos()

    if (photos.length === 0) {
      return new Response('No photos available', { status: 404 })
    }

    const zip = new JSZip()

    await Promise.all(
      photos.map(async (photo, index) => {
        const res = await fetch(photo.url)
        if (!res.ok) return
        const buffer = Buffer.from(await res.arrayBuffer())
        const filename = `${String(index + 1).padStart(2, '0')}-${sanitizeCaption(photo.caption, index)}${extensionFromPath(photo.storage_path)}`
        zip.file(filename, buffer)
      })
    )

    const content = await zip.generateAsync({ type: 'nodebuffer' })

    return new Response(new Uint8Array(content), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="tag-space-photos.zip"',
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return new Response(message, { status: 500 })
  }
}
