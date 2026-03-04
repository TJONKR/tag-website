import Link from 'next/link'

import { PageShell } from '@components/page-shell'
import { EventsHero, EventList } from '@lib/events/components'

export default function EventsPage() {
  return (
    <PageShell>
      <EventsHero />
      <EventList />
      {/* CTA strip */}
      <div className="flex flex-col items-center gap-4 border-t border-tag-border bg-tag-bg-deep px-[60px] py-16 text-center max-md:px-8">
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
    </PageShell>
  )
}
