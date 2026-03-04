'use client'

import { useScrollReveal } from '@hooks/use-scroll-reveal'

interface Event {
  date: string
  title: string
  type: string
  alt?: boolean
}

const events: Event[] = [
  { date: 'MAR 27', title: 'Build Fast Earn Fast', type: 'HACKATHON' },
  { date: 'APR 10', title: 'Demo Night #4', type: 'SHOWCASE', alt: true },
  { date: 'APR 24', title: 'Ship Sprint Weekend', type: 'BUILD' },
]

export const Events = () => {
  const ref = useScrollReveal()

  return (
    <section ref={ref} className="bg-tag-bg">
      {events.map((event, i) => (
        <div
          key={event.date}
          className={`reveal-up flex min-h-[150px] cursor-pointer items-center border-l-0 border-t-[3px] border-l-transparent border-t-tag-border px-[60px] transition-all duration-300 hover:translate-x-2 hover:border-l-[3px] hover:border-l-tag-orange max-md:flex-wrap max-md:gap-2 max-md:px-8 ${
            event.alt ? 'bg-tag-card' : ''
          }`}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <div className="w-[120px] shrink-0 font-mono text-xl font-bold text-tag-orange">
            {event.date}
          </div>
          <div className="flex-1 font-syne text-[clamp(24px,4vw,36px)] text-tag-text">
            {event.title}
          </div>
          <div className="shrink-0 text-right font-mono text-[11px] uppercase text-tag-muted max-md:w-auto max-md:text-left md:w-[200px]">
            {event.type} &rarr;
          </div>
        </div>
      ))}
    </section>
  )
}
