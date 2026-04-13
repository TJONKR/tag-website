'use client'

import Link from 'next/link'
import { Calendar, CheckCircle, Flame } from 'lucide-react'

import { formatDateDisplay } from '@lib/events/types'

interface AttendedEvent {
  id: string
  title: string
  date_iso: string
  checked_in_at: string | null
}

interface ProfileEventTimelineProps {
  events: AttendedEvent[]
}

function getMonthYear(dateIso: string): string {
  const date = new Date(dateIso + 'T00:00:00')
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function calcStreak(events: AttendedEvent[]): number {
  // Events are sorted newest-first
  let streak = 0
  for (const event of events) {
    if (event.checked_in_at) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export const ProfileEventTimeline = ({ events }: ProfileEventTimelineProps) => {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-tag-border bg-tag-card p-6">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Calendar className="size-8 text-tag-dim" />
          <div>
            <p className="font-syne text-sm font-bold text-tag-text">No events yet</p>
            <p className="mt-1 text-sm text-tag-muted">
              Join an event to start building your timeline.
            </p>
          </div>
          <Link
            href="/portal/events"
            className="mt-2 rounded-md bg-tag-orange px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-tag-orange/90"
          >
            Browse events
          </Link>
        </div>
      </div>
    )
  }

  const streak = calcStreak(events)

  // Group events by month/year
  const grouped: { label: string; events: AttendedEvent[] }[] = []
  for (const event of events) {
    const label = getMonthYear(event.date_iso)
    const last = grouped[grouped.length - 1]
    if (last && last.label === label) {
      last.events.push(event)
    } else {
      grouped.push({ label, events: [event] })
    }
  }

  return (
    <div className="rounded-lg border border-tag-border bg-tag-card">
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
            Activity
          </span>
          {streak >= 2 && (
            <span className="flex items-center gap-1.5 rounded-full border border-tag-orange/30 bg-tag-orange/5 px-2.5 py-0.5 text-sm font-medium text-tag-orange">
              <Flame className="size-3" />
              {streak} event streak
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pb-5">
        {grouped.map((group) => (
          <div key={group.label}>
            <p className="mb-2 mt-4 font-mono text-xs font-bold uppercase tracking-[0.15em] text-tag-muted first:mt-0">
              {group.label}
            </p>
            <div className="space-y-0">
              {group.events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-1.5">
                  {/* Timeline dot */}
                  <div className="flex size-5 shrink-0 items-center justify-center">
                    {event.checked_in_at ? (
                      <div className="size-2.5 rounded-full bg-green-500" />
                    ) : (
                      <div className="size-2.5 rounded-full border border-tag-border" />
                    )}
                  </div>
                  <span className="w-12 shrink-0 font-mono text-xs font-bold text-tag-orange">
                    {formatDateDisplay(event.date_iso)}
                  </span>
                  <span className="flex-1 truncate text-sm text-tag-text">{event.title}</span>
                  {event.checked_in_at && (
                    <CheckCircle className="size-3.5 shrink-0 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
