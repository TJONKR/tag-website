'use client'

import Image from 'next/image'
import { CalendarX, Clock, ExternalLink, MapPin } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@components/ui/sheet'

import type { TagEvent } from '@lib/events/types'

const formatTimeRange = (start: string | null, end: string | null): string | null => {
  if (!start) return null
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
}

const formatFullDate = (dateIso: string): string => {
  const date = new Date(dateIso + 'T00:00:00')
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface EventDetailsSheetProps {
  event: TagEvent
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EventDetailsSheet = ({ event, open, onOpenChange }: EventDetailsSheetProps) => {
  const timeRange = formatTimeRange(event.start_at, event.end_at)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full overflow-y-auto border-tag-border bg-tag-bg p-8 text-tag-text sm:max-w-lg sm:p-10 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        <SheetHeader className="space-y-3 pr-8 text-left">
          <div className="flex items-center gap-2">
            {event.luma_event_id && (
              <span className="rounded bg-tag-orange/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-tag-orange">
                Luma
              </span>
            )}
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-dim">
              {event.type}
            </span>
          </div>
          <SheetTitle className="font-syne text-2xl leading-tight text-tag-text">
            {event.title}
          </SheetTitle>
          <SheetDescription className="sr-only">Event details</SheetDescription>
        </SheetHeader>

        {event.cover_url && (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg border border-tag-border">
            <Image
              src={event.cover_url}
              alt={event.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="mt-8 space-y-5 border-y border-tag-border py-6 text-sm">
          <div className="flex items-start gap-4">
            <CalendarX className="mt-0.5 size-4 shrink-0 text-tag-orange" />
            <span className="text-tag-text">{formatFullDate(event.date_iso)}</span>
          </div>
          {timeRange && (
            <div className="flex items-start gap-4">
              <Clock className="mt-0.5 size-4 shrink-0 text-tag-orange" />
              <span className="text-tag-text">{timeRange}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-start gap-4">
              <MapPin className="mt-0.5 size-4 shrink-0 text-tag-orange" />
              <span className="text-tag-text">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-8 whitespace-pre-wrap text-[15px] leading-relaxed text-tag-muted">
            {event.description}
          </p>
        )}

        {event.luma_url && (
          <a
            href={event.luma_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-tag-orange transition-colors hover:bg-tag-orange/20"
          >
            <ExternalLink className="size-3.5" />
            Open on Luma
          </a>
        )}
      </SheetContent>
    </Sheet>
  )
}
