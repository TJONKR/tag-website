'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { ImagePlus, Loader2 } from 'lucide-react'

import { toast } from '@components/toast'
import { fetcher } from '@lib/utils'
import type { Member } from '@lib/people/types'

import { useSpacePhotos } from '../hooks'
import type { SpacePhotoWithUrl } from '../types'
import { SpacePhotoViewer } from './space-photo-viewer'

interface SpacePhotosTabProps {
  initialPhotos: SpacePhotoWithUrl[]
  currentUserId: string | null
  isAdmin: boolean
}

type Filter = 'all' | 'me'

const AvatarStack = ({ tags }: { tags: SpacePhotoWithUrl['tags'] }) => {
  if (tags.length === 0) return null
  const visible = tags.slice(0, 4)
  const extra = Math.max(0, tags.length - visible.length)
  return (
    <div className="flex items-center">
      {visible.map((tag, i) => {
        const initials = (tag.name ?? '?')
          .split(' ')
          .map((s) => s[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
        return (
          <span
            key={tag.id}
            className="relative -ml-2 inline-flex size-7 items-center justify-center overflow-hidden rounded-full border-2 border-tag-bg bg-tag-card text-[10px] font-medium text-tag-text first:ml-0"
            style={{ zIndex: visible.length - i }}
            title={tag.name ?? 'Member'}
          >
            {tag.avatar_url ? (
              <Image
                src={tag.avatar_url}
                alt={tag.name ?? 'Member'}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span>{initials}</span>
            )}
          </span>
        )
      })}
      {extra > 0 && (
        <span className="relative -ml-2 inline-flex size-7 items-center justify-center rounded-full border-2 border-tag-bg bg-tag-orange/80 text-[10px] font-medium text-white">
          +{extra}
        </span>
      )}
    </div>
  )
}

export const SpacePhotosTab = ({
  initialPhotos,
  currentUserId,
  isAdmin,
}: SpacePhotosTabProps) => {
  const { photos, mutate } = useSpacePhotos(initialPhotos)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const viewing = useMemo(
    () => (viewingId ? (photos.find((p) => p.id === viewingId) ?? null) : null),
    [photos, viewingId]
  )

  const { data: members } = useSWR<Member[]>(
    currentUserId ? '/api/people' : null,
    fetcher
  )

  const filtered = useMemo(() => {
    if (filter === 'me' && currentUserId) {
      return photos.filter((p) => p.tags.some((t) => t.user_id === currentUserId))
    }
    return photos
  }, [photos, filter, currentUserId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const formData = new FormData()
      for (const f of files) formData.append('files', f)
      const res = await fetch('/api/space-photos', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.errors?.[0]?.message ?? 'Upload failed')
      }
      const result = (await res.json()) as {
        uploaded: string[]
        failed: { name: string; reason: string }[]
      }
      if (result.uploaded.length > 0) {
        toast({
          type: 'success',
          description: `${result.uploaded.length} photo${result.uploaded.length === 1 ? '' : 's'} uploaded.`,
        })
      }
      for (const f of result.failed) {
        toast({ type: 'error', description: `${f.name}: ${f.reason}` })
      }
      await mutate()
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Upload failed',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex overflow-hidden rounded-md border border-tag-border bg-tag-card">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              filter === 'all'
                ? 'bg-tag-orange text-tag-bg-deep'
                : 'text-tag-muted hover:text-tag-text'
            }`}
          >
            All ({photos.length})
          </button>
          {currentUserId && (
            <button
              type="button"
              onClick={() => setFilter('me')}
              className={`border-l border-tag-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                filter === 'me'
                  ? 'bg-tag-orange text-tag-bg-deep'
                  : 'text-tag-muted hover:text-tag-text'
              }`}
            >
              Tagged me
            </button>
          )}
        </div>

        {isAdmin && (
          <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
            {uploading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ImagePlus className="size-3" />
            )}
            {uploading ? 'Uploading…' : 'Upload'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center font-mono text-sm text-tag-dim">
          {filter === 'me' ? 'No photos with you tagged yet.' : 'No photos yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-4 md:grid-cols-5">
          {filtered.map((photo) => (
            <button
              type="button"
              key={photo.id}
              onClick={() => setViewingId(photo.id)}
              className="group relative aspect-square overflow-hidden bg-tag-card"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="(min-width: 768px) 20vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
              {photo.tags.length > 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="w-full p-2">
                    <AvatarStack tags={photo.tags} />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <SpacePhotoViewer
        photo={viewing}
        onOpenChange={(open) => !open && setViewingId(null)}
        onPhotoMutated={mutate}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        members={members ?? []}
      />
    </div>
  )
}
