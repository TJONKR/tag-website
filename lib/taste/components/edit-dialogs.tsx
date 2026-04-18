'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { Label } from '@components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'

import type { TasteProfileUpdateInput } from '../schema'

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

async function patchTasteProfile(patch: Partial<TasteProfileUpdateInput>) {
  const res = await fetch('/api/taste/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.errors?.[0]?.message ?? 'Could not save.')
  }
}

const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'
const labelClass = 'font-mono text-xs uppercase tracking-[0.08em] text-tag-muted'

// ─────────────────────────────────────────
// Primary / secondary buttons
// ─────────────────────────────────────────
const SaveButton = ({ saving }: { saving: boolean }) => (
  <button
    type="submit"
    disabled={saving}
    className="flex items-center gap-2 rounded-md bg-tag-orange px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-bg transition-colors hover:bg-tag-orange/90 disabled:opacity-50"
  >
    {saving ? (
      <>
        <Loader2 className="size-3 animate-spin" />
        Saving…
      </>
    ) : (
      'Save'
    )}
  </button>
)

const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-md border border-tag-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:text-tag-text"
  >
    Cancel
  </button>
)

// ─────────────────────────────────────────
// Headline (single-line text)
// ─────────────────────────────────────────
interface HeadlineDialogProps extends BaseDialogProps {
  initialValue: string | null
}

export const HeadlineDialog = ({
  open,
  onOpenChange,
  onSaved,
  initialValue,
}: HeadlineDialogProps) => {
  const [value, setValue] = useState(initialValue ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setValue(initialValue ?? '')
  }, [open, initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await patchTasteProfile({ headline: value.trim() })
      toast({ type: 'success', description: 'Headline updated.' })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Could not save.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-tag-border bg-tag-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne text-tag-text">Headline</DialogTitle>
          <DialogDescription className="text-tag-muted">
            One line. Shows at the top of your public profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
            placeholder="e.g. Designer-engineer building AI-native tools"
            maxLength={200}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <CancelButton onClick={() => onOpenChange(false)} />
            <SaveButton saving={saving} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────
// Bio (multi-paragraph textarea)
// ─────────────────────────────────────────
interface BioDialogProps extends BaseDialogProps {
  initialValue: string | null
}

export const BioDialog = ({
  open,
  onOpenChange,
  onSaved,
  initialValue,
}: BioDialogProps) => {
  const [value, setValue] = useState(initialValue ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setValue(initialValue ?? '')
  }, [open, initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await patchTasteProfile({ bio: value.trim() })
      toast({ type: 'success', description: 'Bio updated.' })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Could not save.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-syne text-tag-text">Bio</DialogTitle>
          <DialogDescription className="text-tag-muted">
            Separate paragraphs with a blank line.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={10}
            className={inputClass}
            placeholder="A few paragraphs about who you are and what you do."
            maxLength={4000}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <CancelButton onClick={() => onOpenChange(false)} />
            <SaveButton saving={saving} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────
// String list (one per line) — tags, interests, notable_work, influences
// ─────────────────────────────────────────
type StringListField = 'tags' | 'interests' | 'notable_work' | 'influences'

interface StringListDialogProps extends BaseDialogProps {
  field: StringListField
  title: string
  description: string
  placeholder: string
  initialValue: string[] | null
}

export const StringListDialog = ({
  open,
  onOpenChange,
  onSaved,
  field,
  title,
  description,
  placeholder,
  initialValue,
}: StringListDialogProps) => {
  const [value, setValue] = useState((initialValue ?? []).join('\n'))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setValue((initialValue ?? []).join('\n'))
  }, [open, initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const lines = value
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
      await patchTasteProfile({ [field]: lines })
      toast({ type: 'success', description: `${title} updated.` })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Could not save.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne text-tag-text">{title}</DialogTitle>
          <DialogDescription className="text-tag-muted">
            {description} One per line.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={8}
            className={`${inputClass} font-mono text-sm`}
            placeholder={placeholder}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <CancelButton onClick={() => onOpenChange(false)} />
            <SaveButton saving={saving} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────
// Projects (structured list)
// ─────────────────────────────────────────
interface ProjectRow {
  name: string
  description: string
  url: string
  role: string
}

const emptyProject = (): ProjectRow => ({ name: '', description: '', url: '', role: '' })

interface ProjectsDialogProps extends BaseDialogProps {
  initialValue:
    | { name: string; description: string; url?: string; role?: string }[]
    | null
}

export const ProjectsDialog = ({
  open,
  onOpenChange,
  onSaved,
  initialValue,
}: ProjectsDialogProps) => {
  const [rows, setRows] = useState<ProjectRow[]>([emptyProject()])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setRows(
        (initialValue ?? []).length > 0
          ? (initialValue ?? []).map((p) => ({
              name: p.name,
              description: p.description,
              url: p.url ?? '',
              role: p.role ?? '',
            }))
          : [emptyProject()]
      )
    }
  }, [open, initialValue])

  const updateRow = (i: number, patch: Partial<ProjectRow>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  const addRow = () => setRows((prev) => [...prev, emptyProject()])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const projects = rows
        .filter((r) => r.name.trim() && r.description.trim())
        .map((r) => ({
          name: r.name.trim(),
          description: r.description.trim(),
          url: r.url.trim() || '',
          role: r.role.trim() || '',
        }))
      await patchTasteProfile({ projects })
      toast({ type: 'success', description: 'Projects updated.' })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Could not save.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-syne text-tag-text">Projects</DialogTitle>
          <DialogDescription className="text-tag-muted">
            Things you&apos;re working on or have shipped.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {rows.map((row, i) => (
            <div
              key={i}
              className="space-y-2 rounded-lg border border-tag-border bg-tag-bg/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className={labelClass}>Name</Label>
                      <Input
                        value={row.name}
                        onChange={(e) => updateRow(i, { name: e.target.value })}
                        className={inputClass}
                        placeholder="Project name"
                        maxLength={120}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className={labelClass}>Role (optional)</Label>
                      <Input
                        value={row.role}
                        onChange={(e) => updateRow(i, { role: e.target.value })}
                        className={inputClass}
                        placeholder="founder, contributor…"
                        maxLength={80}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className={labelClass}>Description</Label>
                    <Textarea
                      value={row.description}
                      onChange={(e) =>
                        updateRow(i, { description: e.target.value })
                      }
                      rows={2}
                      className={inputClass}
                      placeholder="One line — what is it?"
                      maxLength={600}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className={labelClass}>URL (optional)</Label>
                    <Input
                      type="url"
                      value={row.url}
                      onChange={(e) => updateRow(i, { url: e.target.value })}
                      className={inputClass}
                      placeholder="https://…"
                    />
                  </div>
                </div>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="mt-1 rounded-md border border-tag-border p-1.5 text-tag-muted transition-colors hover:border-destructive/40 hover:text-destructive"
                    aria-label="Remove project"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tag-border py-3 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:border-tag-orange/40 hover:text-tag-orange"
          >
            <Plus className="size-3" /> Add project
          </button>
          <DialogFooter className="gap-2 sm:gap-0">
            <CancelButton onClick={() => onOpenChange(false)} />
            <SaveButton saving={saving} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────
// Key links (structured list)
// ─────────────────────────────────────────
interface KeyLinkRow {
  url: string
  title: string
  type: string
}

const emptyLink = (): KeyLinkRow => ({ url: '', title: '', type: '' })

interface KeyLinksDialogProps extends BaseDialogProps {
  initialValue: { url: string; title: string; type: string }[] | null
}

export const KeyLinksDialog = ({
  open,
  onOpenChange,
  onSaved,
  initialValue,
}: KeyLinksDialogProps) => {
  const [rows, setRows] = useState<KeyLinkRow[]>([emptyLink()])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setRows(
        (initialValue ?? []).length > 0 ? (initialValue ?? []) : [emptyLink()]
      )
    }
  }, [open, initialValue])

  const updateRow = (i: number, patch: Partial<KeyLinkRow>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  const addRow = () => setRows((prev) => [...prev, emptyLink()])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const key_links = rows
        .filter((r) => r.url.trim() && r.title.trim() && r.type.trim())
        .map((r) => ({
          url: r.url.trim(),
          title: r.title.trim(),
          type: r.type.trim(),
        }))
      await patchTasteProfile({ key_links })
      toast({ type: 'success', description: 'Links updated.' })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Could not save.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-syne text-tag-text">Links</DialogTitle>
          <DialogDescription className="text-tag-muted">
            Where people can find your work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-tag-border bg-tag-bg/40 p-3"
            >
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={row.title}
                    onChange={(e) => updateRow(i, { title: e.target.value })}
                    className={inputClass}
                    placeholder="Title"
                    maxLength={120}
                  />
                  <Input
                    value={row.type}
                    onChange={(e) => updateRow(i, { type: e.target.value })}
                    className={inputClass}
                    placeholder="type — work, article, code…"
                    maxLength={40}
                  />
                </div>
                <Input
                  type="url"
                  value={row.url}
                  onChange={(e) => updateRow(i, { url: e.target.value })}
                  className={inputClass}
                  placeholder="https://…"
                />
              </div>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="mt-1 rounded-md border border-tag-border p-1.5 text-tag-muted transition-colors hover:border-destructive/40 hover:text-destructive"
                  aria-label="Remove link"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tag-border py-3 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:border-tag-orange/40 hover:text-tag-orange"
          >
            <Plus className="size-3" /> Add link
          </button>
          <DialogFooter className="gap-2 sm:gap-0">
            <CancelButton onClick={() => onOpenChange(false)} />
            <SaveButton saving={saving} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
