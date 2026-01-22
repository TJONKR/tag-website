import { ArrowUpRight } from 'lucide-react'

interface Event {
  id: string
  title: string
  type: string
  date: string
  imageUrl?: string
  link?: string
}

const events: Event[] = [
  {
    id: '1',
    title: 'Bring your own Startup 🚀',
    type: 'Hackathon',
    date: 'Saturday, January 24',
    link: '#',
  },
  {
    id: '2',
    title: 'Build Fast Earn Fast — Where Builders Become Founders',
    type: 'Hackathon',
    date: 'Friday, February 27',
    link: '#',
  },
  {
    id: '3',
    title: 'To be determined (Thomas)',
    type: 'Hackathon',
    date: 'To be determined',
    link: '#',
  },
]

export const CoworkingSpace = () => {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Coworking Space
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          People who ship things fast, share skills, help each other.
        </p>

        {/* Weekdays Section */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500">
            Weekdays are about momentum
          </h3>
          <p className="mt-4 text-muted-foreground">
            People work on their own projects, share progress, help each other out, and slowly
            build things into something real.
          </p>
        </div>

        {/* Weekends Section */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500">
            On weekends, we build.
          </h3>
          <p className="mt-4 text-muted-foreground">
            In the weekends, the space is an open build room. People come to work on whatever
            they&apos;re obsessed with, share what they&apos;re learning, and see what happens when
            builders spend time together.
          </p>
        </div>

        {/* Events Section */}
        <div className="mt-16">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500">Events</h3>

          <div className="mt-6 space-y-0 divide-y divide-border">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            We regularly organize new events. More dates will be announced soon.
          </p>
        </div>
      </div>
    </section>
  )
}

interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <a
      href={event.link}
      className="group flex items-center gap-4 py-6 transition-colors hover:bg-muted/50"
    >
      {/* Event Image Placeholder */}
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        <div className="flex size-full items-center justify-center">
          <span className="text-xs text-muted-foreground">IMG</span>
        </div>
      </div>

      {/* Event Info */}
      <div className="flex-1">
        <h4 className="font-semibold text-foreground group-hover:text-red-500">{event.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.type} – {event.date}
        </p>
      </div>

      {/* Arrow */}
      <ArrowUpRight className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
    </a>
  )
}
