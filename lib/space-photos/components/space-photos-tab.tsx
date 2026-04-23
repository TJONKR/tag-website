'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { ConfirmDialog } from '@components/confirm-dialog'
import { toast } from '@components/toast'

import { useSpacePhotos } from '../hooks'
import type { SpacePhotoWithUrl } from '../types'

interface SpacePhotosTabProps {
  initialPhotos: SpacePhotoWithUrl[]
}

export const SpacePhotosTab = ({ initialPhotos }: SpacePhotosTabProps) => {
  const { photos, mutate } = useSpacePhotos(initialPhotos)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<SpacePhotoWithUrl | null>(null)
  const [caption, setCaption] = useState('')
  const [savingCaption, setSavingCaption] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/space-photos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.errors?.[0]?.message ?? 'Upload failed')
      }

      toast({ type: 'success', description: 'Photo uploaded.' })
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

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/space-photos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.errors?.[0]?.message ?? 'Delete failed')
      }
      toast({ type: 'success', description: 'Photo deleted.' })
      await mutate()
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Delete failed',
      })
    }
  }

  const openCaptionEditor = (photo: SpacePhotoWithUrl) => {
    setEditing(photo)
    setCaption(photo.caption ?? '')
  }

  const saveCaption = async () => {
    if (!editing) return
    setSavingCaption(true)
    try {
      const res = await fetch(`/api/space-photos/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: caption || null }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.errors?.[0]?.message ?? 'Save failed')
      }
      toast({ type: 'success', description: 'Caption saved.' })
      await mutate()
      setEditing(null)
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Save failed',
      })
    } finally {
      setSavingCaption(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-xs text-tag-dim">
          {photos.length} photo{photos.length === 1 ? '' : 's'} shown on /host-event
        </p>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
          {uploading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <ImagePlus className="size-3" />
          )}
          {uploading ? 'Uploading…' : 'Upload photo'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <p className="py-12 text-center font-mono text-sm text-tag-dim">
          No photos yet. Upload JPEG, PNG, or WebP up to 5 MB.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-tag-border bg-tag-card"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? 'TAG space'}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex items-start justify-between gap-2 p-3">
                <p className="min-w-0 flex-1 truncate font-mono text-xs text-tag-muted">
                  {photo.caption ?? <span className="text-tag-dim">No caption</span>}
                </p>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openCaptionEditor(photo)}
                    className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-bg hover:text-tag-text"
                    aria-label="Edit caption"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <ConfirmDialog
                    trigger={
                      <button
                        type="button"
                        className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-bg hover:text-destructive"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    }
                    title="Delete this photo?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDelete(photo.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="border-tag-border bg-tag-bg text-tag-text sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne">Edit caption</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption"
              maxLength={200}
              className="border-tag-border bg-tag-card"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                className="border-tag-border"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={saveCaption}
                disabled={savingCaption}
                className="gap-2 bg-tag-orange text-tag-bg hover:bg-tag-orange/90"
              >
                {savingCaption && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
