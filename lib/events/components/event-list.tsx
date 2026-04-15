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
    <section>
      {/* Upcoming events */}
      <div className="px-[60px] py-4 max-md:px-8">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-tag-dim">
          Upcoming
        </span>
      </div>
      {upcoming.length > 0 ? (
        upcoming.map((event) => (
          <EventRow key={event.id} event={event} />
        ))
      ) : (
        <div className="flex flex-col items-center px-[60px] py-12 text-center max-md:px-8">
          <CalendarX className="size-8 text-tag-dim" />
          <p className="mt-3 font-syne text-lg font-bold text-tag-text">No upcoming events</p>
          <p className="mt-1 text-sm text-tag-muted">
            There are no events scheduled yet. Check back soon or browse past events below.
          </p>
        </div>
      )}

      {/* Past events */}
      <div className="flex items-center justify-between px-[60px] py-4 max-md:px-8">
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
    </section>
  )
}
