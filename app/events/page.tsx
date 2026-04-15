import Link from 'next/link'

import { PageShell } from '@components/page-shell'
import { EventsHero, EventList } from '@lib/events/components'
import { getUpcomingEvents, getPastEvents } from '@lib/events/queries'

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])

  return (
    <PageShell>
      <EventsHero />
      <EventList upcoming={upcoming} past={past} />
      {/* CTA strip */}
      <div className="border-t border-tag-border bg-tag-bg-deep px-[60px] py-16 max-md:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 text-center">
          <p className="font-syne text-2xl text-tag-text">
            Never miss a TAG Night.
          </p>
          <Link
            href="/join"
            className="bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b]"
          >
            Tag In &rarr;
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
