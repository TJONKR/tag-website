'use client'

import { useState } from 'react'

import { EventRow } from '@lib/events/components/event-row'

import type { TagEvent } from '@lib/events/types'

interface EventListProps {
  upcoming: TagEvent[]
  past: TagEvent[]
}

export const EventList = ({ upcoming, past }: EventListProps) => {
  const [showPast, setShowPast] = useState(false)

  return (
    <section>
      {/* Upcoming events */}
      <div className="px-[60px] py-4 max-md:px-8">
        <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-tag-dim">
          Upcoming
        </span>
      </div>
      {upcoming.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}

      {/* Past events */}
      <div className="flex items-center justify-between px-[60px] py-4 max-md:px-8">
        <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-tag-dim">
          Past Events
        </span>
        <button
          onClick={() => setShowPast((prev) => !prev)}
          className="font-mono text-[12px] uppercase tracking-[0.1em] text-tag-muted transition-colors hover:text-tag-orange"
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
