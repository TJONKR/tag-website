'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Button } from '@components/ui/button'

import { Checkbox } from '@components/ui/checkbox'
import { toast } from '@components/toast'
import type { TagEvent } from '@lib/events/types'

const EVENT_TYPES = ['Event', 'Internal Event', 'Hackathon'] as const

interface EventFormDialogProps {
  event?: TagEvent
  trigger: React.ReactNode
  isAdmin?: boolean
}

export const EventFormDialog = ({ event, trigger, isAdmin }: EventFormDialogProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [publishToLuma, setPublishToLuma] = useState(false)

  const isEdit = !!event
  const isLinkedToLuma = !!event?.luma_event_id

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setGeneralError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      title: form.get('title') as string,
      type: form.get('type') as string,
      description: form.get('description') as string,
      date_iso: form.get('date_iso') as string,
      location: form.get('location') as string,
    }

    try {
      const url = isEdit ? `/api/events/${event.id}` : '/api/events'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        const issues = data.errors as { path?: (string | number)[]; message: string }[]

        if (issues?.length) {
          const fieldErrors: Record<string, string> = {}
          const general: string[] = []

          for (const issue of issues) {
            const field = issue.path?.[0]
            if (field && typeof field === 'string') {
              fieldErrors[field] = issue.message
            } else {
              general.push(issue.message)
            }
          }

          setErrors(fieldErrors)
          if (general.length) setGeneralError(general.join('. '))
        } else {
          setGeneralError('Something went wrong')
        }
        return
      }

      // If publishing to Luma on create, push the event
      if (!isEdit && publishToLuma) {
        const eventData = await res.json()
        if (eventData.id) {
          try {
            const lumaRes = await fetch('/api/luma/push', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventId: eventData.id }),
            })
            if (lumaRes.ok) {
              const { lumaUrl } = await lumaRes.json()
              toast({
                type: 'success',
                description: `Event published to Luma: ${lumaUrl}`,
              })
            }
          } catch {
            toast({ type: 'error', description: 'Event created but Luma publish failed' })
          }
        }
      }

      setOpen(false)
      toast({
        type: 'success',
        description: isEdit ? 'Event updated' : 'Event created',
      })
      router.refresh()
    } catch {
      setGeneralError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-tag-border bg-tag-bg text-tag-text sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne">{isEdit ? 'Edit Event' : 'Add Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event?.title}
              required
              className="border-tag-border bg-tag-card"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue={event?.type || 'Event'}>
              <SelectTrigger className="border-tag-border bg-tag-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-tag-border bg-tag-bg">
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={event?.description}
              required
              className="border-tag-border bg-tag-card"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_iso">Date</Label>
            <Input
              id="date_iso"
              name="date_iso"
              type="date"
              defaultValue={event?.date_iso}
              required
              className="border-tag-border bg-tag-card [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
            />
            {errors.date_iso && <p className="text-xs text-destructive">{errors.date_iso}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event?.location || 'TAG HQ, Amsterdam'}
              required
              className="border-tag-border bg-tag-card"
            />
            {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
          </div>

          {/* Luma integration */}
          {isAdmin && !isEdit && !isLinkedToLuma && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="publish_to_luma"
                checked={publishToLuma}
                onCheckedChange={(checked) => setPublishToLuma(checked === true)}
              />
              <Label htmlFor="publish_to_luma" className="text-sm font-normal">
                Publish to Luma
              </Label>
            </div>
          )}
          {isLinkedToLuma && event?.luma_url && (
            <div className="text-xs text-tag-muted">
              Linked to Luma:{' '}
              <a
                href={event.luma_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tag-orange underline"
              >
                View on Luma
              </a>
            </div>
          )}

          {generalError && <p className="text-sm text-destructive">{generalError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-tag-border"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-tag-orange hover:bg-[#e8551b]">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
