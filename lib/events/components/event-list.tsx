'use client'

import { useState } from 'react'
import { CalendarX } from 'lucide-react'

import { EventRow } from '@lib/events/components/event-row'

import type { TagEvent } from '@lib/events/types'

interface EventListProps {
  upcoming: TagEvent[]
  past: TagEvent[]
}

export const EventList = ({ upcoming, past }: EventListProps) => {
  const [showPast, setShowPast] = useState(upcoming.length === 0)

  return (
    <section className="px-[60px] max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Upcoming events */}
        <div className="py-4">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-tag-dim">
            Upcoming
          </span>
        </div>
        {upcoming.length > 0 ? (
          upcoming.map((event) => (
            <EventRow key={event.id} event={event} />
          ))
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <CalendarX className="size-8 text-tag-dim" />
            <p className="mt-3 font-syne text-lg font-bold text-tag-text">Nothing announced yet</p>
            <p className="mt-1 text-sm text-tag-muted">
              New events are in the works. Check back soon or browse past events below.
            </p>
          </div>
        )}

        {/* Past events */}
        <div className="flex items-center justify-between py-4">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-tag-dim">
            Past Events
          </span>
          <button
            onClick={() => setShowPast((prev) => !prev)}
            className="font-mono text-xs uppercase tracking-[0.1em] text-tag-muted transition-colors hover:text-tag-orange"
          >
            {showPast ? 'Hide' : 'Show'} &rarr;
          </button>
        </div>
        {showPast &&
          past.map((event) => (
            <EventRow key={event.id} event={event} muted />
          ))}
      </div>
    </section>
  )
}
