'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarX, ExternalLink, Pencil, Sparkles, Trash2 } from 'lucide-react'

import { cn } from '@lib/utils'
import { toast } from '@components/toast'
import { ConfirmDialog } from '@components/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import {
  PORTAL_TABS_LIST_CLASSES,
  PORTAL_TABS_TRIGGER_CLASSES,
} from '@lib/portal/components/portal-tabs-style'

import { formatDateDisplay } from '@lib/events/types'
import type { TagEvent } from '@lib/events/types'
import { EventFormDialog } from './event-form-dialog'
import { AttendanceDialog } from './attendance-dialog'

interface PortalEventListProps {
  upcoming: TagEvent[]
  past: TagEvent[]
  isAdmin: boolean
  attendanceSummaries?: Record<string, { total: number; checkedIn: number }>
}

const PortalEventRow = ({
  event,
  muted = false,
  isAdmin,
  attendanceSummary,
}: {
  event: TagEvent
  muted?: boolean
  isAdmin: boolean
  attendanceSummary?: { total: number; checkedIn: number }
}) => {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ type: 'success', description: 'Event deleted' })
      router.refresh()
    } catch {
      toast({ type: 'error', description: 'Failed to delete event' })
      setDeleting(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-t border-tag-border px-4 py-4 transition-all duration-300 hover:border-l-2 hover:border-l-tag-orange',
        muted && 'opacity-50'
      )}
    >
      <div
        className={cn(
          'font-mono text-sm font-bold',
          muted ? 'text-tag-dim' : 'text-tag-orange'
        )}
      >
        {formatDateDisplay(event.date_iso)}
      </div>
      <span className="font-syne text-base text-tag-text">{event.title}</span>
      <div className="flex items-center gap-2">
        {muted && attendanceSummary && attendanceSummary.total > 0 && (
          <span className="font-mono text-sm text-tag-muted">
            {attendanceSummary.checkedIn}/{attendanceSummary.total} checked in
          </span>
        )}
        {event.luma_event_id && (
          <span className="rounded bg-tag-orange/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-tag-orange">
            Luma
          </span>
        )}
        <span className="font-mono text-xs uppercase tracking-wider text-tag-dim">
          {event.type}
        </span>
        {isAdmin && (
          <>
            {event.luma_url && (
              <a
                href={event.luma_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-orange"
                aria-label="Open on Luma"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
            {muted && (
              <AttendanceDialog
                eventId={event.id}
                eventTitle={event.title}
                isLumaLinked={!!event.luma_event_id}
              />
            )}
            <EventFormDialog
              event={event}
              isAdmin={isAdmin}
              trigger={
                <button
                  className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-text"
                  aria-label="Edit event"
                >
                  <Pencil className="size-3.5" />
                </button>
              }
            />
            <ConfirmDialog
              trigger={
                <button
                  disabled={deleting}
                  className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-destructive"
                  aria-label="Delete event"
                >
                  <Trash2 className="size-3.5" />
                </button>
              }
              title="Delete event?"
              description="This action cannot be undone."
              onConfirm={handleDelete}
            />
          </>
        )}
      </div>
    </div>
  )
}

const HostEventContent = () => (
  <>
    <div className="space-y-8">
      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-tag-orange">
          1. Pitch Your Idea
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-tag-muted">
          Talk to a community manager about your event idea. It can be anything — a workshop,
          talk, demo night, hackathon, movie night, or something entirely new. We&apos;re open to
          creative formats.
        </p>
      </div>

      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-tag-orange">
          2. Pick a Date & Format
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-tag-muted">
          Together with the community manager, find a date that works. Consider weekday evenings
          or weekend afternoons. Decide on the format: presentation, hands-on workshop, open
          discussion, etc.
        </p>
      </div>

      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-tag-orange">
          3. Space & Setup
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-tag-muted">
          The event space fits up to 50 people and includes a projector, sound system, and
          flexible seating. Let us know what you need and we&apos;ll help set it up. You can also
          use the lounge for more informal gatherings.
        </p>
      </div>

      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-tag-orange">
          4. Promotion
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-tag-muted">
          We&apos;ll help promote your event through our Slack, social channels, and the events
          page. Provide a short description, date, and any relevant links. The more details, the
          better.
        </p>
      </div>

      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-tag-orange">
          5. Guidelines
        </h3>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-tag-muted">
          <li className="flex gap-2">
            <span className="text-tag-dim">—</span> Events should be relevant and valuable to
            the TAG community
          </li>
          <li className="flex gap-2">
            <span className="text-tag-dim">—</span> No hard sales pitches — sharing knowledge
            and experience is the goal
          </li>
          <li className="flex gap-2">
            <span className="text-tag-dim">—</span> Clean up after your event and leave the
            space as you found it
          </li>
          <li className="flex gap-2">
            <span className="text-tag-dim">—</span> External guests are welcome but must be
            registered in advance
          </li>
        </ul>
      </div>
    </div>

    <div className="mt-10 rounded-lg border border-tag-border bg-tag-card p-5">
      <p className="text-sm text-tag-muted">
        Ready to go? Reach out to a community manager on Slack or in person and we&apos;ll help
        you make it happen.
      </p>
    </div>
  </>
)

export const PortalEventList = ({
  upcoming,
  past,
  isAdmin,
  attendanceSummaries,
}: PortalEventListProps) => {
  const defaultTab = upcoming.length === 0 && past.length > 0 ? 'past' : 'upcoming'

  return (
    <>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={PORTAL_TABS_LIST_CLASSES}>
          <TabsTrigger value="upcoming" className={PORTAL_TABS_TRIGGER_CLASSES}>
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className={PORTAL_TABS_TRIGGER_CLASSES}>
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0">
          <div className="rounded-lg border border-tag-border bg-tag-card">
            {upcoming.length > 0 ? (
              upcoming.map((event) => (
                <PortalEventRow
                  key={event.id}
                  event={event}
                  isAdmin={isAdmin}
                  attendanceSummary={attendanceSummaries?.[event.id]}
                />
              ))
            ) : (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <CalendarX className="size-8 text-tag-dim" />
                <p className="mt-3 font-syne text-lg font-bold text-tag-text">
                  Nothing announced yet
                </p>
                <p className="mt-1 text-sm text-tag-muted">
                  New events are in the works. Check back soon or browse past events.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="rounded-lg border border-tag-border bg-tag-card">
            {past.length > 0 ? (
              past.map((event) => (
                <PortalEventRow
                  key={event.id}
                  event={event}
                  muted
                  isAdmin={isAdmin}
                  attendanceSummary={attendanceSummaries?.[event.id]}
                />
              ))
            ) : (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <CalendarX className="size-8 text-tag-dim" />
                <p className="mt-3 font-syne text-lg font-bold text-tag-text">No past events yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Host your own event CTA */}
      <Dialog>
        <div className="mt-6 rounded-lg border border-dashed border-tag-orange/20 bg-tag-orange/[0.03] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-tag-orange" />
              <div>
                <h3 className="font-medium text-tag-text">Want to host your own event?</h3>
                <p className="mt-1 text-sm text-tag-muted">
                  We encourage members to organize events — we think that&apos;s awesome! Talk to a
                  community manager to get started.
                </p>
              </div>
            </div>
            <DialogTrigger asChild>
              <button className="shrink-0 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
                Learn more
              </button>
            </DialogTrigger>
          </div>
        </div>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-syne text-3xl font-bold text-tag-text">
              Host Your Own Event
            </DialogTitle>
            <DialogDescription className="text-tag-muted">
              We love it when members organize events. Here are the guidelines to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <HostEventContent />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
