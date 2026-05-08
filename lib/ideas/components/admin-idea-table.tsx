'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { toast } from '@components/toast'

import { useAdminIdeas } from '../hooks'
import type { IdeaStatus, IdeaWithAuthor } from '../types'

import { StatusBadge } from './status-badge'

const STATUS_OPTIONS: { value: IdeaStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'planned', label: 'Planned' },
  { value: 'done', label: 'Done' },
  { value: 'rejected', label: 'Rejected' },
]

const FILTER_OPTIONS: { value: IdeaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  ...STATUS_OPTIONS,
]

const getInitials = (name: string | null) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

interface AdminIdeaTableProps {
  initialIdeas: IdeaWithAuthor[]
}

export const AdminIdeaTable = ({ initialIdeas }: AdminIdeaTableProps) => {
  const [filter, setFilter] = useState<IdeaStatus | 'all'>('all')
  const { ideas, mutate } = useAdminIdeas(
    filter === 'all' ? undefined : filter,
    filter === 'all' ? initialIdeas : undefined
  )
  const [selected, setSelected] = useState<IdeaWithAuthor | null>(null)
  const [status, setStatus] = useState<IdeaStatus>('new')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const openDialog = (idea: IdeaWithAuthor) => {
    setSelected(idea)
    setStatus(idea.status)
    setNote(idea.admin_note ?? '')
  }

  const closeDialog = () => {
    setSelected(null)
    setNote('')
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/ideas/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_note: note || null }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.errors?.[0]?.message ?? 'Failed to update idea')
      }
      toast({ type: 'success', description: 'Idea updated.' })
      await mutate()
      closeDialog()
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-lg border px-4 py-2 font-mono text-xs transition-colors ${
              filter === opt.value
                ? 'border-tag-orange bg-tag-orange/10 text-tag-orange'
                : 'border-tag-border bg-tag-card text-tag-muted hover:border-tag-orange/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {ideas.length === 0 ? (
        <p className="py-12 text-center font-mono text-sm text-tag-dim">No ideas in this view.</p>
      ) : (
        <ul className="space-y-3">
          {ideas.map((idea) => (
            <li key={idea.id}>
              <button
                type="button"
                onClick={() => openDialog(idea)}
                className="w-full rounded-lg border border-tag-border bg-tag-card p-4 text-left transition-colors hover:border-tag-orange/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-grotesk text-base font-medium text-tag-text">
                      {idea.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 font-grotesk text-sm text-tag-muted">
                      {idea.body}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar className="size-5">
                        {idea.author?.avatar_url && (
                          <AvatarImage
                            src={idea.author.avatar_url}
                            alt={idea.author.name ?? 'Author'}
                          />
                        )}
                        <AvatarFallback className="bg-tag-border text-[9px] text-tag-text">
                          {getInitials(idea.author?.name ?? null)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-mono text-xs text-tag-dim">
                        {idea.author?.name ?? 'Unknown'} · {formatDate(idea.created_at)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={idea.status} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-tag-border bg-tag-bg text-tag-text">
          <DialogHeader>
            <DialogTitle className="font-syne text-xl">{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <p className="whitespace-pre-wrap font-grotesk text-sm text-tag-muted">
                {selected.body}
              </p>
              <p className="font-mono text-xs text-tag-dim">
                {selected.author?.name ?? 'Unknown'} · {formatDate(selected.created_at)}
              </p>

              <div className="space-y-2">
                <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted">
                  Status
                </p>
                <Select value={status} onValueChange={(v) => setStatus(v as IdeaStatus)}>
                  <SelectTrigger className="border-tag-border bg-tag-card text-tag-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-tag-border bg-tag-bg">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted">
                  Admin note (visible to author)
                </p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note for the author"
                  className="min-h-[100px] border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim"
                  maxLength={2000}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-tag-border pt-4">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  disabled={saving}
                  className="border-tag-border text-tag-text hover:border-tag-orange hover:text-tag-orange"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 bg-tag-orange text-tag-bg hover:bg-tag-orange/90"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
