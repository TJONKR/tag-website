import Image from 'next/image'
import { Download } from 'lucide-react'

import type { SpacePhotoWithUrl } from '../types'

interface SpacePhotosGalleryProps {
  photos: SpacePhotoWithUrl[]
}

const filenameFor = (photo: SpacePhotoWithUrl, index: number) => {
  const extMatch = photo.storage_path.toLowerCase().match(/\.(jpe?g|png|webp)$/)
  const ext = extMatch ? extMatch[0] : '.jpg'
  const base = photo.caption
    ? photo.caption
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 60)
    : `tag-space-${index + 1}`
  return `${base || `tag-space-${index + 1}`}${ext}`
}

export const SpacePhotosGallery = ({ photos }: SpacePhotosGalleryProps) => {
  if (photos.length === 0) return null

  return (
    <section className="px-[60px] pb-24 max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-syne text-2xl font-bold text-tag-text">The space</h2>
          <a
            href="/api/space-photos/download"
            className="flex items-center gap-2 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20"
          >
            <Download className="size-3.5" />
            Download all ({photos.length})
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => {
            const filename = filenameFor(photo, index)
            const downloadUrl = `${photo.url}?download=${encodeURIComponent(filename)}`
            return (
              <figure
                key={photo.id}
                className="group relative overflow-hidden rounded-lg border border-tag-border bg-tag-card"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? 'TAG space'}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                  <a
                    href={downloadUrl}
                    download={filename}
                    aria-label={`Download ${photo.caption ?? 'photo'}`}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-md bg-tag-bg/80 text-tag-text opacity-0 backdrop-blur transition-opacity hover:bg-tag-bg group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Download className="size-3.5" />
                  </a>
                </div>
                {photo.caption && (
                  <figcaption className="p-3 font-mono text-xs text-tag-muted">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
