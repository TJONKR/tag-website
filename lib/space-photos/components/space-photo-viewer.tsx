'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Calendar, Loader2, Plus, Trash2, X } from 'lucide-react'
// X is used inline for untag button

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@components/ui/dialog'
import { ConfirmDialog } from '@components/confirm-dialog'
import { toast } from '@components/toast'
import { cn } from '@lib/utils'
import type { Member } from '@lib/people/types'

import type { SpacePhotoTag, SpacePhotoWithUrl } from '../types'

interface SpacePhotoViewerProps {
  photo: SpacePhotoWithUrl | null
  onOpenChange: (open: boolean) => void
  onPhotoMutated: () => Promise<unknown> | void
  currentUserId: string | null
  isAdmin: boolean
  members: Member[]
}

const formatTakenAt = (iso: string | null) => {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const SpacePhotoViewer = ({
  photo,
  onOpenChange,
  onPhotoMutated,
  currentUserId,
  isAdmin,
  members,
}: SpacePhotoViewerProps) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickerOpen])

  const taggedIds = useMemo(
    () => new Set((photo?.tags ?? []).map((t) => t.user_id)),
    [photo]
  )
  const searchable = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members
      .filter((m) => !taggedIds.has(m.id))
      .filter((m) => {
        if (!q) return true
        const name = (m.name ?? '').toLowerCase()
        return name.includes(q) || m.email.toLowerCase().includes(q)
      })
      .slice(0, 8)
  }, [members, taggedIds, search])

  if (!photo) return null

  const takenLabel = formatTakenAt(photo.taken_at ?? photo.created_at)

  const handleTag = async (memberId: string) => {
    setBusy(`add:${memberId}`)
    try {
      const res = await fetch(`/api/space-photos/${photo.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId }),
      })
      if (!res.ok) throw new Error()
      setSearch('')
      setPickerOpen(false)
      await onPhotoMutated()
    } catch {
      toast({ type: 'error', description: 'Failed to tag.' })
    } finally {
      setBusy(null)
    }
  }

  const handleUntag = async (tag: SpacePhotoTag) => {
    setBusy(`del:${tag.user_id}`)
    try {
      const res = await fetch(`/api/space-photos/${photo.id}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tag.user_id }),
      })
      if (!res.ok) throw new Error()
      await onPhotoMutated()
    } catch {
      toast({ type: 'error', description: 'Failed to remove tag.' })
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/space-photos/${photo.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ type: 'success', description: 'Photo deleted.' })
      onOpenChange(false)
      await onPhotoMutated()
    } catch {
      toast({ type: 'error', description: 'Failed to delete.' })
    }
  }

  return (
    <Dialog open={!!photo} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] w-[95vw] max-w-5xl flex-col overflow-hidden border-tag-border bg-tag-bg p-0 text-tag-text sm:flex-row [&>button[type=button]:last-child]:right-3 [&>button[type=button]:last-child]:top-3 [&>button[type=button]:last-child]:z-20 [&>button[type=button]:last-child]:rounded-full [&>button[type=button]:last-child]:bg-black/50 [&>button[type=button]:last-child]:p-1.5 [&>button[type=button]:last-child]:text-white">
        <DialogTitle className="sr-only">Photo details</DialogTitle>
        <DialogDescription className="sr-only">
          View, tag members, and remove tags on this photo.
        </DialogDescription>

        {/* Photo */}
        <div className="relative flex-1 bg-black sm:min-h-[70vh]">
          <Image
            src={photo.url}
            alt=""
            fill
            sizes="(min-width: 768px) 70vw, 100vw"
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Sidebar */}
        <div className="flex w-full shrink-0 flex-col gap-5 overflow-y-auto border-t border-tag-border bg-tag-bg p-5 sm:w-80 sm:border-l sm:border-t-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {takenLabel && (
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-tag-dim">
              <Calendar className="size-3.5" />
              {takenLabel}
            </div>
          )}

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-tag-dim">
              Tagged
            </p>
            <ul className="mt-3 space-y-2">
              {photo.tags.length === 0 && (
                <li className="text-sm text-tag-muted">No one tagged yet.</li>
              )}
              {photo.tags.map((tag) => {
                const initials = (tag.name ?? '?')
                  .split(' ')
                  .map((s) => s[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <li
                    key={tag.id}
                    className="flex items-center gap-3 rounded-md border border-tag-border bg-tag-card px-2.5 py-1.5"
                  >
                    <span className="relative inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tag-bg text-[10px] font-medium text-tag-text">
                      {tag.avatar_url ? (
                        <Image
                          src={tag.avatar_url}
                          alt={tag.name ?? 'Member'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        initials
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-tag-text">
                      {tag.name ?? 'Unnamed'}
                    </span>
                    {currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleUntag(tag)}
                        disabled={busy === `del:${tag.user_id}`}
                        className="rounded p-1 text-tag-muted transition-colors hover:bg-tag-bg hover:text-destructive disabled:opacity-50"
                        aria-label="Remove tag"
                      >
                        {busy === `del:${tag.user_id}` ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <X className="size-3.5" />
                        )}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            {currentUserId && (
              <div className="mt-3">
                {pickerOpen ? (
                  <div
                    ref={pickerRef}
                    className="space-y-2 rounded-md border border-tag-border bg-tag-card p-2.5"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search members..."
                      className="w-full rounded border border-tag-border bg-tag-bg px-2 py-1.5 text-sm text-tag-text placeholder:text-tag-dim focus:border-tag-orange focus:outline-none"
                    />
                    <ul className="max-h-48 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                      {searchable.length === 0 && (
                        <li className="px-2 py-1 text-xs text-tag-dim">No matches.</li>
                      )}
                      {searchable.map((member) => {
                        const initials = (member.name ?? '?')
                          .split(' ')
                          .map((s) => s[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                        return (
                          <li key={member.id}>
                            <button
                              type="button"
                              onClick={() => handleTag(member.id)}
                              disabled={busy === `add:${member.id}`}
                              className={cn(
                                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-tag-text transition-colors',
                                'hover:bg-tag-bg disabled:opacity-50'
                              )}
                            >
                              <span className="relative inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tag-border text-[9px]">
                                {member.avatar_url ? (
                                  <Image
                                    src={member.avatar_url}
                                    alt={member.name ?? 'Member'}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  initials
                                )}
                              </span>
                              <span className="truncate">{member.name ?? member.email}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerOpen(false)
                        setSearch('')
                      }}
                      className="font-mono text-[10px] uppercase tracking-wider text-tag-muted transition-colors hover:text-tag-text"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-tag-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:border-tag-orange/30 hover:text-tag-orange"
                  >
                    <Plus className="size-3" />
                    Tag someone
                  </button>
                )}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="mt-auto border-t border-tag-border pt-4">
              <ConfirmDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" />
                    Delete photo
                  </button>
                }
                title="Delete this photo?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
