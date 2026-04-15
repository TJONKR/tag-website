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
        'flex flex-col gap-2 border-l-0 border-t border-l-transparent border-t-tag-border px-[60px] py-4 transition-all duration-300 hover:border-l-[3px] hover:border-l-tag-orange max-md:px-8',
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
    </div>
  )
}
