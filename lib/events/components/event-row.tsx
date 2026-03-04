import { cn } from '@lib/utils'

import type { TagEvent } from '@lib/events/data'

interface EventRowProps {
  event: TagEvent
  muted?: boolean
}

export const EventRow = ({ event, muted = false }: EventRowProps) => {
  return (
    <div
      className={cn(
        'flex min-h-[100px] cursor-pointer items-center border-l-0 border-t border-l-transparent border-t-tag-border px-[60px] transition-all duration-300 hover:translate-x-2 hover:border-l-[3px] hover:border-l-tag-orange max-md:flex-wrap max-md:gap-2 max-md:px-8',
        muted && 'opacity-50'
      )}
    >
      <div
        className={cn(
          'w-[120px] shrink-0 font-mono text-xl font-bold',
          muted ? 'text-tag-dim' : 'text-tag-orange'
        )}
      >
        {event.date}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-syne text-[clamp(20px,3vw,28px)] text-tag-text">
          {event.title}
        </span>
        <span className="text-sm text-tag-muted">{event.description}</span>
      </div>
      <div className="shrink-0 text-right font-mono text-[11px] uppercase text-tag-muted max-md:w-auto max-md:text-left md:w-[200px]">
        {event.type}
      </div>
    </div>
  )
}
