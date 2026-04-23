import Image from 'next/image'

import type { SpacePhotoWithUrl } from '../types'

interface SpacePhotosGalleryProps {
  photos: SpacePhotoWithUrl[]
}

export const SpacePhotosGallery = ({ photos }: SpacePhotosGalleryProps) => {
  if (photos.length === 0) return null

  return (
    <section className="px-[60px] pb-24 max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="mb-6 font-syne text-2xl font-bold text-tag-text">The space</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className="overflow-hidden rounded-lg border border-tag-border bg-tag-card"
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
              </div>
              {photo.caption && (
                <figcaption className="p-3 font-mono text-xs text-tag-muted">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
