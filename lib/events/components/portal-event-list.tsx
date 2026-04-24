'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarX, ExternalLink, Pencil, Sparkles, Trash2 } from 'lucide-react'

import { cn } from '@lib/utils'
import { toast } from '@components/toast'
import { ConfirmDialog } from '@components/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import {
  PORTAL_TABS_LIST_CLASSES,
  PORTAL_TABS_TRIGGER_CLASSES,
} from '@lib/portal/components/portal-tabs-style'

import { formatDateDisplay } from '@lib/events/types'
import type { TagEvent } from '@lib/events/types'
import { EventApplicationList } from '@lib/event-applications/components'
import type {
  EventHostApplication,
  EventApplicationCounts,
} from '@lib/event-applications/types'
import { EventFormDialog } from './event-form-dialog'
import { AttendanceDialog } from './attendance-dialog'
import { EventDetailsSheet } from './event-details-sheet'

interface PortalEventListProps {
  upcoming: TagEvent[]
  past: TagEvent[]
  isAdmin: boolean
  attendanceSummaries?: Record<string, { total: number; checkedIn: number }>
  hostRequests?: EventHostApplication[]
  hostRequestCounts?: EventApplicationCounts
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
  const [detailsOpen, setDetailsOpen] = useState(false)

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

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setDetailsOpen(true)
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col gap-2 border-t border-tag-border px-4 py-4 transition-all duration-300 hover:border-l-2 hover:border-l-tag-orange',
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
        {event.is_externally_managed && event.external_host && (
          <span className="font-mono text-xs text-tag-muted">
            Hosted by {event.external_host}
          </span>
        )}
        <div className="flex items-center gap-2">
          {muted && attendanceSummary && attendanceSummary.total > 0 && (
            <span className="font-mono text-sm text-tag-muted">
              {attendanceSummary.checkedIn}/{attendanceSummary.total} checked in
            </span>
          )}
          {event.is_externally_managed ? (
            <span className="rounded bg-tag-dim/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-tag-muted">
              External
            </span>
          ) : (
            event.luma_event_id && (
              <span className="rounded bg-tag-orange/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-tag-orange">
                Luma
              </span>
            )
          )}
          <span className="font-mono text-xs uppercase tracking-wider text-tag-dim">
            {event.type}
          </span>
          {isAdmin && (
            <div className="flex items-center gap-1" onClick={stop}>
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
              {!event.is_externally_managed && muted && (
                <AttendanceDialog
                  eventId={event.id}
                  eventTitle={event.title}
                  isLumaLinked={!!event.luma_event_id}
                />
              )}
              {!event.is_externally_managed && (
                <>
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
          )}
        </div>
      </div>
      <EventDetailsSheet event={event} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  )
}

export const PortalEventList = ({
  upcoming,
  past,
  isAdmin,
  attendanceSummaries,
  hostRequests,
  hostRequestCounts,
}: PortalEventListProps) => {
  const defaultTab = upcoming.length === 0 && past.length > 0 ? 'past' : 'upcoming'
  const showRequests = isAdmin && hostRequests && hostRequestCounts

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
          {showRequests && (
            <TabsTrigger value="requests" className={PORTAL_TABS_TRIGGER_CLASSES}>
              Requests ({hostRequestCounts.pending})
            </TabsTrigger>
          )}
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

        {showRequests && (
          <TabsContent value="requests" className="mt-0">
            <EventApplicationList
              initialApplications={hostRequests}
              initialCounts={hostRequestCounts}
              initialSelectedId={null}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Host your own event CTA */}
      <div className="mt-6 rounded-lg border border-dashed border-tag-orange/20 bg-tag-orange/[0.03] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-tag-orange" />
            <div>
              <h3 className="font-medium text-tag-text">Want to host your own event?</h3>
              <p className="mt-1 text-sm text-tag-muted">
                We encourage members to organize events — we think that&apos;s awesome! Submit a
                request and we&apos;ll get back to you.
              </p>
            </div>
          </div>
          <Link
            href="/host-event"
            className="shrink-0 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20"
          >
            Request event
          </Link>
        </div>
      </div>
    </>
  )
}
