'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@lib/utils'

import type { UserPhoto } from '../types'
import { MAX_PHOTOS } from '../types'

interface PhotoUploadProps {
  initialPhotos: UserPhoto[]
  photoUrls: Record<string, string>
}

export const PhotoUpload = ({ initialPhotos, photoUrls }: PhotoUploadProps) => {
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canUpload = photos.length < MAX_PHOTOS

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        toast.error('File must be under 2MB')
        return
      }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('photo', file)

        const res = await fetch('/api/profile/photos', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Upload failed')
          return
        }

        const data = await res.json()
        // Add placeholder photo to list — URL will show on refresh
        setPhotos((prev) => [
          ...prev,
          { id: data.id, user_id: '', storage_path: '', created_at: new Date().toISOString() },
        ])
        toast.success('Photo uploaded')
        // Refresh to get signed URL
        window.location.reload()
      } catch {
        toast.error('Upload failed')
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    []
  )

  const handleDelete = useCallback(async (photoId: string) => {
    setDeletingId(photoId)
    try {
      const res = await fetch('/api/profile/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Delete failed')
        return
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      toast.success('Photo removed')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tag-orange/10">
          <Camera className="size-5 text-tag-orange" />
        </div>
        <div>
          <p className="font-syne text-sm font-bold text-tag-text">Reference Photos</p>
          <p className="text-xs text-tag-muted">
            {photos.length}/{MAX_PHOTOS} photos — used to generate your lootbox skin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Existing photos */}
        {photos.map((photo) => {
          const url = photoUrls[photo.id]
          return (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-tag-border bg-tag-card"
            >
              {url ? (
                <Image
                  src={url}
                  alt="Reference photo"
                  fill
                  className="object-cover"
                  sizes="120px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-tag-muted" />
                </div>
              )}

              {/* Delete overlay */}
              <button
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
              >
                {deletingId === photo.id ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Trash2 className="size-5 text-white" />
                )}
              </button>
            </div>
          )
        })}

        {/* Upload slot(s) */}
        {canUpload && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'flex aspect-square items-center justify-center rounded-lg',
              'border-2 border-dashed border-tag-border',
              'transition-colors hover:border-tag-orange/50 hover:bg-tag-orange/5',
              uploading && 'pointer-events-none opacity-50'
            )}
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-tag-muted" />
            ) : (
              <Upload className="size-6 text-tag-muted" />
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />

      {photos.length < MAX_PHOTOS && (
        <p className="text-xs text-amber-400">
          Upload {MAX_PHOTOS - photos.length} more photo{MAX_PHOTOS - photos.length > 1 ? 's' : ''}{' '}
          to unlock your lootbox
        </p>
      )}
    </div>
  )
}
