'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react'

import { cn } from '@lib/utils'
import { toast } from '@components/toast'

import { formatDateDisplay } from '@lib/events/types'
import type { TagEvent } from '@lib/events/types'
import { EventFormDialog } from './event-form-dialog'

interface PortalEventListProps {
  upcoming: TagEvent[]
  past: TagEvent[]
  isAdmin: boolean
}

const PortalEventRow = ({
  event,
  muted = false,
  isAdmin,
}: {
  event: TagEvent
  muted?: boolean
  isAdmin: boolean
}) => {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return
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
        'flex items-center border-t border-tag-border px-4 py-4 transition-all duration-300 hover:translate-x-1 hover:border-l-2 hover:border-l-tag-orange max-md:flex-wrap max-md:gap-1',
        muted && 'opacity-50'
      )}
    >
      <div
        className={cn(
          'w-20 shrink-0 font-mono text-sm font-bold',
          muted ? 'text-tag-dim' : 'text-tag-orange'
        )}
      >
        {formatDateDisplay(event.date_iso)}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-syne text-lg text-tag-text">{event.title}</span>
        <span className="text-xs text-tag-muted">{event.description}</span>
      </div>
      <div className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-tag-dim max-md:w-auto max-md:text-left md:w-28 md:text-right">
        {event.type}
      </div>
      {isAdmin && (
        <div className="ml-3 flex shrink-0 items-center gap-1">
          <EventFormDialog
            event={event}
            trigger={
              <button
                className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-text"
                aria-label="Edit event"
              >
                <Pencil className="size-3.5" />
              </button>
            }
          />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-destructive"
            aria-label="Delete event"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

const HostEventModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tag-bg/95 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl px-6 py-16">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-md border border-tag-border p-2 text-tag-muted transition-colors hover:border-tag-dim hover:text-tag-text"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <h2 className="font-syne text-3xl font-bold text-tag-text">Host Your Own Event</h2>
        <p className="mt-2 text-tag-muted">
          We love it when members organize events. Here are the guidelines to get started.
        </p>

        <div className="mt-10 space-y-8">
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
      </div>
    </div>
  )
}

export const PortalEventList = ({ upcoming, past, isAdmin }: PortalEventListProps) => {
  const [showPast, setShowPast] = useState(false)
  const [showHostModal, setShowHostModal] = useState(false)

  return (
    <>
      <div className="rounded-lg border border-tag-border bg-tag-card">
        {/* Upcoming */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
            Upcoming
          </span>
          {isAdmin && (
            <EventFormDialog
              trigger={
                <button className="flex items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
                  <Plus className="size-3" />
                  Add Event
                </button>
              }
            />
          )}
        </div>
        {upcoming.length > 0 ? (
          upcoming.map((event) => (
            <PortalEventRow key={event.id} event={event} isAdmin={isAdmin} />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-tag-muted">No upcoming events</div>
        )}

        {/* Past */}
        <div className="flex items-center justify-between border-t border-tag-border px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
            Past Events
          </span>
          <button
            onClick={() => setShowPast((prev) => !prev)}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-muted transition-colors hover:text-tag-orange"
          >
            {showPast ? 'Hide' : 'Show'} &rarr;
          </button>
        </div>
        {showPast &&
          past.map((event) => (
            <PortalEventRow key={event.id} event={event} muted isAdmin={isAdmin} />
          ))}
      </div>

      {/* Host your own event CTA */}
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
          <button
            onClick={() => setShowHostModal(true)}
            className="shrink-0 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20"
          >
            Learn more
          </button>
        </div>
      </div>

      {showHostModal && <HostEventModal onClose={() => setShowHostModal(false)} />}
    </>
  )
}
