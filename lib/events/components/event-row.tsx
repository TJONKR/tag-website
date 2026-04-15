import { cn } from '@lib/utils'

import { formatDateDisplay } from '@lib/events/types'
import type { TagEvent } from '@lib/events/types'

interface EventRowProps {
  event: TagEvent
  muted?: boolean
}

export const EventRow = ({ event, muted = false }: EventRowProps) => {
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 border-t border-t-tag-border py-4',
        muted && 'opacity-50'
      )}
    >
      <div
        className={cn(
          'font-mono text-xl font-bold',
          muted ? 'text-tag-dim' : 'text-tag-orange'
        )}
      >
        {formatDateDisplay(event.date_iso)}
      </div>
      <span className="font-syne text-base text-tag-text">
        {event.title}
      </span>
      <div className="font-mono text-[11px] uppercase text-tag-muted">
        {event.type}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-full origin-bottom scale-y-0 border-b-2 border-tag-orange transition-transform duration-300 group-hover:h-full group-hover:scale-y-100" />
    </div>
  )
}
