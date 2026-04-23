'use client'

import { useRef, useState, useCallback } from 'react'
import {
  Building,
  CircleParking,
  Coffee,
  Globe,
  GripVertical,
  Link2,
  Hash,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ScrollText,
  Trash2,
  Users,
  Wifi,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '@lib/utils'
import { toast } from '@components/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { Button } from '@components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'

import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import { ConfirmDialog } from '@components/confirm-dialog'
import { FloorPlanMap } from './floor-plan-map'
import { PORTAL_TABS_LIST_CLASSES, PORTAL_TABS_TRIGGER_CLASSES } from './portal-tabs-style'
import { SpacePhotosTab } from '@lib/space-photos/components'
import type { SpacePhotoWithUrl } from '@lib/space-photos/types'
import { IdeaList } from '@lib/ideas/components'
import type { Idea } from '@lib/ideas/types'
import type { ContactItem, Facility, Guideline, OpeningHours } from '@lib/portal/types'

const tabs = [
  { key: 'floor-plan', label: 'Floor Plan' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'hours', label: 'Opening Hours' },
  { key: 'guidelines', label: 'Guidelines' },
  { key: 'photos', label: 'Photos' },
  { key: 'ideas', label: 'Ideas' },
  { key: 'contact', label: 'Contact' },
] as const

type Tab = (typeof tabs)[number]['key']

const FACILITY_ICONS = [
  { value: 'building', label: 'General', icon: Building },
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'users', label: 'Meeting', icon: Users },
  { value: 'coffee', label: 'Kitchen', icon: Coffee },
  { value: 'parking', label: 'Parking', icon: CircleParking },
  { value: 'lock', label: 'Lock', icon: Lock },
] as const

const facilityIconMap: Record<string, React.ComponentType<{ className?: string }>> =
  Object.fromEntries(FACILITY_ICONS.map((i) => [i.value, i.icon]))

const CONTACT_ICONS = [
  { value: 'mappin', label: 'Location', icon: MapPin },
  { value: 'hash', label: 'Chat', icon: Hash },
  { value: 'mail', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'globe', label: 'Website', icon: Globe },
  { value: 'building', label: 'General', icon: Building },
] as const

const contactIconMap: Record<string, React.ComponentType<{ className?: string }>> =
  Object.fromEntries(CONTACT_ICONS.map((i) => [i.value, i.icon]))

// --- Markdown link parser ---

const renderWithLinks = (text: string) => {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/)
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-tag-orange underline decoration-tag-orange/30 transition-colors hover:decoration-tag-orange"
        >
          {match[1]}
        </a>
      )
    }
    return part
  })
}

// --- Generic CRUD helpers ---

async function apiSubmit<T = unknown>(
  url: string,
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.errors?.[0]?.message || 'Something went wrong')
  }
  return res.json()
}

async function apiDelete(url: string) {
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete')
}

// --- Form Dialogs ---

const RichTextarea = ({
  id,
  name,
  defaultValue,
  required,
}: {
  id: string
  name: string
  defaultValue?: string
  required?: boolean
}) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const cursorRef = useRef(0)

  const openPopover = () => {
    if (ref.current) cursorRef.current = ref.current.selectionStart
    setLabel('')
    setUrl('')
    setPopoverOpen(true)
  }

  const confirmLink = () => {
    const textarea = ref.current
    if (!textarea || !label || !url) return

    const pos = cursorRef.current
    const before = textarea.value.slice(0, pos)
    const after = textarea.value.slice(pos)
    const markdown = `[${label}](${url})`

    const nativeSet = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set
    nativeSet?.call(textarea, before + markdown + after)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    setPopoverOpen(false)
    textarea.focus()
    const newPos = pos + markdown.length
    textarea.setSelectionRange(newPos, newPos)
  }

  return (
    <div className="overflow-hidden rounded-md border border-tag-border transition-colors focus-within:border-tag-orange">
      <div className="relative flex items-center gap-1 border-b border-tag-border bg-tag-card/50 px-2 py-1.5">
        <button
          type="button"
          onClick={openPopover}
          className={cn(
            'flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors',
            popoverOpen
              ? 'bg-tag-orange/10 text-tag-orange'
              : 'text-tag-muted hover:bg-tag-border hover:text-tag-text'
          )}
          title="Insert link"
        >
          <Link2 className="size-3.5" />
          Link
        </button>

        {popoverOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 w-72 rounded-lg border border-tag-border bg-tag-bg p-3 shadow-xl">
            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-tag-dim">
                  Label
                </label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Click here"
                  className="h-8 border-tag-border bg-tag-card text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (label && url) confirmLink()
                    }
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-tag-dim">
                  URL
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  type="url"
                  className="h-8 border-tag-border bg-tag-card text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (label && url) confirmLink()
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPopoverOpen(false)}
                  className="rounded px-2.5 py-1 text-xs text-tag-muted transition-colors hover:text-tag-text"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLink}
                  disabled={!label || !url}
                  className="rounded bg-tag-orange px-2.5 py-1 text-xs text-white transition-colors hover:bg-tag-orange/90 disabled:opacity-40"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Textarea
        ref={ref}
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="rounded-none border-0 bg-transparent shadow-none ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  )
}

const FacilityFormDialog = ({
  facility,
  trigger,
  onSaved,
  onAdded,
}: {
  facility?: Facility
  trigger: React.ReactNode
  onSaved?: (updated: Facility) => void
  onAdded?: (item: Facility) => void
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEdit = !!facility

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get('name') as string,
      description: form.get('description') as string,
      icon: form.get('icon') as string,
      sort_order: facility?.sort_order ?? 999,
    }

    if (isEdit) {
      const original = facility
      const optimistic = { ...original, ...body }
      onSaved?.(optimistic)
      setOpen(false)
      toast({ type: 'success', description: 'Facility updated' })
      try {
        const { item } = await apiSubmit<{ item: Facility }>(
          `/api/facilities/${facility.id}`,
          'PUT',
          body
        )
        onSaved?.(item)
      } catch (err) {
        onSaved?.(original)
        toast({
          type: 'error',
          description: err instanceof Error ? err.message : 'Something went wrong',
        })
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const { item } = await apiSubmit<{ item: Facility }>('/api/facilities', 'POST', body)
        onAdded?.(item)
        setOpen(false)
        toast({ type: 'success', description: 'Facility added' })
      } catch (err) {
        toast({
          type: 'error',
          description: err instanceof Error ? err.message : 'Something went wrong',
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-tag-border bg-tag-bg text-tag-text sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne">
            {isEdit ? 'Edit Facility' : 'Add Facility'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={facility?.name}
              required
              className="border-tag-border bg-tag-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fac-description">Description</Label>
            <RichTextarea
              id="fac-description"
              name="description"
              defaultValue={facility?.description}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select name="icon" defaultValue={facility?.icon || 'building'}>
              <SelectTrigger className="border-tag-border bg-tag-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-tag-border bg-tag-bg">
                {FACILITY_ICONS.map((i) => {
                  const Icon = i.icon
                  return (
                    <SelectItem key={i.value} value={i.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-3.5" />
                        {i.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-tag-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-tag-orange hover:bg-[#e8551b]"
            >
              {loading ? 'Saving...' : isEdit ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const GuidelineFormDialog = ({
  rule,
  trigger,
  onSaved,
  onAdded,
}: {
  rule?: Guideline
  trigger: React.ReactNode
  onSaved?: (updated: Guideline) => void
  onAdded?: (item: Guideline) => void
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEdit = !!rule

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const body = {
      title: form.get('title') as string,
      description: form.get('description') as string,
      sort_order: rule?.sort_order ?? 999,
    }

    if (isEdit) {
      const original = rule
      const optimistic = { ...original, ...body }
      onSaved?.(optimistic)
      setOpen(false)
      toast({ type: 'success', description: 'Rule updated' })
      try {
        const { item } = await apiSubmit<{ item: Guideline }>(
          `/api/guidelines/${rule.id}`,
          'PUT',
          body
        )
        onSaved?.(item)
      } catch (err) {
        onSaved?.(original)
        toast({
          type: 'error',
          description: err instanceof Error ? err.message : 'Something went wrong',
        })
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const { item } = await apiSubmit<{ item: Guideline }>('/api/guidelines', 'POST', body)
        onAdded?.(item)
        setOpen(false)
        toast({ type: 'success', description: 'Rule added' })
      } catch (err) {
        toast({
          type: 'error',
          description: err instanceof Error ? err.message : 'Something went wrong',
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-tag-border bg-tag-bg text-tag-text sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne">{isEdit ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={rule?.title}
              required
              className="border-tag-border bg-tag-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-description">Description</Label>
            <RichTextarea
              id="rule-description"
              name="description"
              defaultValue={rule?.description}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-tag-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-tag-orange hover:bg-[#e8551b]"
            >
              {loading ? 'Saving...' : isEdit ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const OpeningHoursFormDialog = ({
  entry,
  trigger,
  onSaved,
}: {
  entry: OpeningHours
  trigger: React.ReactNode
  onSaved?: (updated: OpeningHours) => void
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const body = {
      day: entry.day,
      hours: form.get('hours') as string,
      building: form.get('building') as string,
      note: (form.get('note') as string) || null,
      sort_order: entry.sort_order,
    }

    const original = entry
    const optimistic = { ...original, ...body }
    onSaved?.(optimistic)
    setOpen(false)
    toast({ type: 'success', description: 'Hours updated' })
    try {
      const { item } = await apiSubmit<{ item: OpeningHours }>(
        `/api/opening-hours/${entry.id}`,
        'PUT',
        body
      )
      onSaved?.(item)
    } catch (err) {
      onSaved?.(original)
      toast({
        type: 'error',
        description: err instanceof Error ? err.message : 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-tag-border bg-tag-bg text-tag-text sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne">Edit {entry.day}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hours">TAG hours</Label>
            <Input
              id="hours"
              name="hours"
              defaultValue={entry.hours}
              placeholder="e.g. 04:00 – 23:59"
              className="border-tag-border bg-tag-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="building">Building hours</Label>
            <Input
              id="building"
              name="building"
              defaultValue={entry.building}
              placeholder="e.g. 08:00 – 17:00"
              className="border-tag-border bg-tag-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              name="note"
              defaultValue={entry.note ?? ''}
              placeholder="e.g. Available on request"
              className="border-tag-border bg-tag-card"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-tag-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-tag-orange hover:bg-[#e8551b]"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const ContactFormDialog = ({
  item,
  trigger,
  onSaved,
  onAdded,
}: {
  item?: ContactItem
  trigger: React.ReactNode
  onSaved?: (updated: ContactItem) => void
  onAdded?: (item: ContactItem) => void
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEdit = !!item

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const body = {
      title: form.get('title') as string,
      description: form.get('description') as string,
      icon: form.get('icon') as string,
      sort_order: item?.sort_order ?? 999,
    }

    if (isEdit) {
      const original = item
      const optimistic = { ...original, ...body }
      onSaved?.(optimistic)
      setOpen(false)
      toast({ type: 'success', description: 'Contact updated' })
      try {
        const { item: saved } = await apiSubmit<{ item: ContactItem }>(
          `/api/contact-items/${item.id}`,
          'PUT',
          body
        )
        onSaved?.(saved)
      } catch (err) {
        onSaved?.(original)
        toast({
          type: 'error',
          description: err instanceof Error ? err.message : 'Something went wrong',
        })
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const { item: created } = await apiSubmit<{ item: ContactItem }>(
          '/api/contact-items',
          'POST',
          body
        )
        onAdded?.(created)
        setOpen(false)
        toast({ type: 'success', description: 'Contact added' })
      } catch (err) {
        toast({
          type: 'error',
          description: err instanceof Error ? err.message : 'Something went wrong',
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-tag-border bg-tag-bg text-tag-text sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne">
            {isEdit ? 'Edit Contact' : 'Add Contact'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={item?.title}
              required
              className="border-tag-border bg-tag-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-description">Description</Label>
            <RichTextarea
              id="contact-description"
              name="description"
              defaultValue={item?.description}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select name="icon" defaultValue={item?.icon || 'building'}>
              <SelectTrigger className="border-tag-border bg-tag-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-tag-border bg-tag-bg">
                {CONTACT_ICONS.map((i) => {
                  const Icon = i.icon
                  return (
                    <SelectItem key={i.value} value={i.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-3.5" />
                        {i.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-tag-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-tag-orange hover:bg-[#e8551b]"
            >
              {loading ? 'Saving...' : isEdit ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- Delete button ---

const DeleteButton = ({
  url,
  label,
  onDeleted,
  onRollback,
}: {
  url: string
  label: string
  onDeleted?: () => void
  onRollback?: () => void
}) => {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    onDeleted?.()
    toast({ type: 'success', description: `${label} deleted` })
    try {
      await apiDelete(url)
    } catch {
      onRollback?.()
      toast({ type: 'error', description: `Failed to delete ${label.toLowerCase()}` })
      setDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <button
          disabled={deleting}
          className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-destructive"
          aria-label={`Delete ${label.toLowerCase()}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      }
      title={`Delete ${label.toLowerCase()}?`}
      description="This action cannot be undone."
      onConfirm={handleDelete}
    />
  )
}

const AdminActions = ({ children }: { children: React.ReactNode }) => (
  <div className="ml-auto flex shrink-0 items-center gap-1 pl-3">{children}</div>
)

// --- Sortable items ---

const SortableFacilityCard = ({
  facility,
  isAdmin,
  onSaved,
  onDeleted,
  onDeleteRollback,
}: {
  facility: Facility
  isAdmin: boolean
  onSaved?: (updated: Facility) => void
  onDeleted?: () => void
  onDeleteRollback?: () => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: facility.id,
    disabled: !isAdmin,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = facilityIconMap[facility.icon]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-tag-border bg-tag-card p-5 transition-colors hover:border-tag-dim',
        isDragging && 'z-10 shadow-lg opacity-90'
      )}
    >
      <div className="flex items-start gap-3">
        {isAdmin && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab touch-none text-tag-dim hover:text-tag-muted active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>
        )}
        {Icon && (
          <div className="mt-0.5 text-tag-orange">
            <Icon className="size-4" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium text-tag-text">{facility.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-tag-muted">{renderWithLinks(facility.description)}</p>
        </div>
        {isAdmin && (
          <AdminActions>
            <FacilityFormDialog
              facility={facility}
              onSaved={onSaved}
              trigger={
                <button
                  className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-text"
                  aria-label="Edit facility"
                >
                  <Pencil className="size-3.5" />
                </button>
              }
            />
            <DeleteButton
              url={`/api/facilities/${facility.id}`}
              label="Facility"
              onDeleted={onDeleted}
              onRollback={onDeleteRollback}
            />
          </AdminActions>
        )}
      </div>
    </div>
  )
}

const SortableGuidelineCard = ({
  rule,
  isAdmin,
  onSaved,
  onDeleted,
  onDeleteRollback,
}: {
  rule: Guideline
  isAdmin: boolean
  onSaved?: (updated: Guideline) => void
  onDeleted?: () => void
  onDeleteRollback?: () => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rule.id,
    disabled: !isAdmin,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-tag-border bg-tag-card p-5 transition-colors hover:border-tag-dim',
        isDragging && 'z-10 shadow-lg opacity-90'
      )}
    >
      <div className="flex items-start gap-3">
        {isAdmin && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab touch-none text-tag-dim hover:text-tag-muted active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <div className="mt-0.5 text-tag-orange">
          <ScrollText className="size-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-tag-text">{rule.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-tag-muted">{renderWithLinks(rule.description)}</p>
        </div>
        {isAdmin && (
          <AdminActions>
            <GuidelineFormDialog
              rule={rule}
              onSaved={onSaved}
              trigger={
                <button
                  className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-text"
                  aria-label="Edit rule"
                >
                  <Pencil className="size-3.5" />
                </button>
              }
            />
            <DeleteButton
              url={`/api/guidelines/${rule.id}`}
              label="Rule"
              onDeleted={onDeleted}
              onRollback={onDeleteRollback}
            />
          </AdminActions>
        )}
      </div>
    </div>
  )
}

const SortableContactCard = ({
  item,
  isAdmin,
  onSaved,
  onDeleted,
  onDeleteRollback,
}: {
  item: ContactItem
  isAdmin: boolean
  onSaved?: (updated: ContactItem) => void
  onDeleted?: () => void
  onDeleteRollback?: () => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !isAdmin,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = contactIconMap[item.icon]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-tag-border bg-tag-card p-5 transition-colors hover:border-tag-dim',
        isDragging && 'z-10 shadow-lg opacity-90'
      )}
    >
      <div className="flex items-start gap-3">
        {isAdmin && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab touch-none text-tag-dim hover:text-tag-muted active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>
        )}
        {Icon && (
          <div className="mt-0.5 text-tag-orange">
            <Icon className="size-4" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium text-tag-text">{item.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-tag-muted">{renderWithLinks(item.description)}</p>
        </div>
        {isAdmin && (
          <AdminActions>
            <ContactFormDialog
              item={item}
              onSaved={onSaved}
              trigger={
                <button
                  className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-text"
                  aria-label="Edit contact"
                >
                  <Pencil className="size-3.5" />
                </button>
              }
            />
            <DeleteButton
              url={`/api/contact-items/${item.id}`}
              label="Contact"
              onDeleted={onDeleted}
              onRollback={onDeleteRollback}
            />
          </AdminActions>
        )}
      </div>
    </div>
  )
}

// --- Main component ---

interface SpaceTabsProps {
  facilities: Facility[]
  openingHours: OpeningHours[]
  guidelines: Guideline[]
  contactItems: ContactItem[]
  spacePhotos: SpacePhotoWithUrl[]
  ideas: Idea[]
  isAdmin: boolean
  currentUserId: string | null
}

export const SpaceTabs = ({
  facilities: initialFacilities,
  openingHours: initialHours,
  guidelines: initialGuidelines,
  contactItems: initialContacts,
  spacePhotos,
  ideas,
  isAdmin,
  currentUserId,
}: SpaceTabsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('floor-plan')
  const [facilities, setFacilities] = useState(initialFacilities)
  const [hours, setHours] = useState(initialHours)
  const [guidelines, setGuidelines] = useState(initialGuidelines)
  const [contactItems, setContactItems] = useState(initialContacts)

  // --- Optimistic update helpers ---

  const handleFacilitySaved = useCallback(
    (updated: Facility) => setFacilities((prev) => prev.map((f) => (f.id === updated.id ? updated : f))),
    []
  )
  const handleFacilityAdded = useCallback(
    (item: Facility) => setFacilities((prev) => [...prev, item]),
    []
  )

  const handleGuidelineSaved = useCallback(
    (updated: Guideline) => setGuidelines((prev) => prev.map((r) => (r.id === updated.id ? updated : r))),
    []
  )
  const handleGuidelineAdded = useCallback(
    (item: Guideline) => setGuidelines((prev) => [...prev, item]),
    []
  )

  const handleHoursSaved = useCallback(
    (updated: OpeningHours) => setHours((prev) => prev.map((h) => (h.id === updated.id ? updated : h))),
    []
  )

  const handleContactSaved = useCallback(
    (updated: ContactItem) => setContactItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c))),
    []
  )
  const handleContactAdded = useCallback(
    (item: ContactItem) => setContactItems((prev) => [...prev, item]),
    []
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleFacilityDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = facilities.findIndex((f) => f.id === active.id)
    const newIndex = facilities.findIndex((f) => f.id === over.id)
    const reordered = arrayMove(facilities, oldIndex, newIndex)
    setFacilities(reordered)

    try {
      await apiSubmit('/api/facilities/reorder', 'PUT', {
        ids: reordered.map((f) => f.id),
      })
    } catch {
      setFacilities(facilities)
      toast({ type: 'error', description: 'Failed to reorder' })
    }
  }

  const handleGuidelineDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = guidelines.findIndex((r) => r.id === active.id)
    const newIndex = guidelines.findIndex((r) => r.id === over.id)
    const reordered = arrayMove(guidelines, oldIndex, newIndex)
    setGuidelines(reordered)

    try {
      await apiSubmit('/api/guidelines/reorder', 'PUT', {
        ids: reordered.map((r) => r.id),
      })
    } catch {
      setGuidelines(guidelines)
      toast({ type: 'error', description: 'Failed to reorder' })
    }
  }

  const handleContactDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = contactItems.findIndex((c) => c.id === active.id)
    const newIndex = contactItems.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(contactItems, oldIndex, newIndex)
    setContactItems(reordered)

    try {
      await apiSubmit('/api/contact-items/reorder', 'PUT', {
        ids: reordered.map((c) => c.id),
      })
    } catch {
      setContactItems(contactItems)
      toast({ type: 'error', description: 'Failed to reorder' })
    }
  }

  return (
    <>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="w-full">
        <TabsList className={PORTAL_TABS_LIST_CLASSES}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className={PORTAL_TABS_TRIGGER_CLASSES}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Floor Plan */}
      {activeTab === 'floor-plan' && <FloorPlanMap />}

      {/* Photos */}
      {activeTab === 'photos' && (
        <SpacePhotosTab
          initialPhotos={spacePhotos}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
      {/* Facilities */}
      {activeTab === 'facilities' && (
        <div className="grid gap-4">
          {isAdmin && (
            <div className="flex justify-end">
              <FacilityFormDialog
                onAdded={handleFacilityAdded}
                trigger={
                  <button className="flex items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
                    <Plus className="size-3" />
                    Add Facility
                  </button>
                }
              />
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleFacilityDragEnd}
          >
            <SortableContext
              items={facilities.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {facilities.map((facility) => (
                <SortableFacilityCard
                  key={facility.id}
                  facility={facility}
                  isAdmin={isAdmin}
                  onSaved={handleFacilitySaved}
                  onDeleted={() => setFacilities((prev) => prev.filter((f) => f.id !== facility.id))}
                  onDeleteRollback={() => setFacilities((prev) => {
                    if (prev.some((f) => f.id === facility.id)) return prev
                    const restored = [...prev, facility].sort((a, b) => a.sort_order - b.sort_order)
                    return restored
                  })}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Opening Hours */}
      {activeTab === 'hours' && (
        <>
          <div className="rounded-lg border border-tag-border bg-tag-card">
            <div className="flex items-center border-b border-tag-border px-5 py-3">
              <span className="flex-1 text-xs font-medium uppercase tracking-wide text-tag-dim" />
              <span className="w-36 text-right text-xs font-medium uppercase tracking-wide text-tag-dim">
                TAG
              </span>
              <span className="w-36 text-right text-xs font-medium uppercase tracking-wide text-tag-dim">
                The Hubb
              </span>
              {isAdmin && <span className="w-16" />}
            </div>
            {hours.map((entry, i) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center px-5 py-4',
                  i !== hours.length - 1 && 'border-b border-tag-border'
                )}
              >
                <div className="flex-1">
                  <span className="font-medium text-tag-text">{entry.day}</span>
                  {entry.note && (
                    <p className="mt-0.5 text-sm text-tag-muted">{entry.note}</p>
                  )}
                </div>
                <span
                  className={cn(
                    'w-36 text-right font-mono text-sm',
                    entry.hours === 'Closed' ? 'text-tag-dim' : 'text-tag-orange'
                  )}
                >
                  {entry.hours}
                </span>
                <span
                  className={cn(
                    'w-36 text-right font-mono text-sm',
                    entry.building === 'Closed' ? 'text-tag-dim' : 'text-tag-muted'
                  )}
                >
                  {entry.building}
                </span>
                {isAdmin && (
                  <AdminActions>
                    <OpeningHoursFormDialog
                      entry={entry}
                      onSaved={handleHoursSaved}
                      trigger={
                        <button
                          className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-text"
                          aria-label="Edit hours"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      }
                    />
                  </AdminActions>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-tag-border bg-tag-card p-5">
            <h3 className="font-medium text-tag-text">Building Access — The Hubb</h3>
            <p className="mt-2 text-sm leading-relaxed text-tag-muted">
              TAG is located inside The Hubb. The front door of the building is open from{' '}
              <span className="font-mono text-tag-orange">08:00 – 17:00</span> on weekdays. Outside
              these hours you can continue working, but the doors will be locked. You can be let in
              by other members or contact a community manager in advance.
            </p>
          </div>
        </>
      )}

      {/* Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="grid gap-4">
          {isAdmin && (
            <div className="flex justify-end">
              <GuidelineFormDialog
                onAdded={handleGuidelineAdded}
                trigger={
                  <button className="flex items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
                    <Plus className="size-3" />
                    Add Guideline
                  </button>
                }
              />
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleGuidelineDragEnd}
          >
            <SortableContext
              items={guidelines.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {guidelines.map((rule) => (
                <SortableGuidelineCard
                  key={rule.id}
                  rule={rule}
                  isAdmin={isAdmin}
                  onSaved={handleGuidelineSaved}
                  onDeleted={() => setGuidelines((prev) => prev.filter((r) => r.id !== rule.id))}
                  onDeleteRollback={() => setGuidelines((prev) => {
                    if (prev.some((r) => r.id === rule.id)) return prev
                    const restored = [...prev, rule].sort((a, b) => a.sort_order - b.sort_order)
                    return restored
                  })}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Ideas */}
      {activeTab === 'ideas' && <IdeaList initialIdeas={ideas} />}

      {/* Contact */}
      {activeTab === 'contact' && (
        <div className="grid gap-4">
          {isAdmin && (
            <div className="flex justify-end">
              <ContactFormDialog
                onAdded={handleContactAdded}
                trigger={
                  <button className="flex items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
                    <Plus className="size-3" />
                    Add Contact
                  </button>
                }
              />
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleContactDragEnd}
          >
            <SortableContext
              items={contactItems.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {contactItems.map((item) => (
                <SortableContactCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onSaved={handleContactSaved}
                  onDeleted={() => setContactItems((prev) => prev.filter((c) => c.id !== item.id))}
                  onDeleteRollback={() => setContactItems((prev) => {
                    if (prev.some((c) => c.id === item.id)) return prev
                    const restored = [...prev, item].sort((a, b) => a.sort_order - b.sort_order)
                    return restored
                  })}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </>
  )
}
