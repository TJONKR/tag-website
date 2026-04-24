import { PageShell } from '@components/page-shell'
import { EventHostForm, EventHostHero } from '@lib/event-applications/components'

export const metadata = {
  title: 'Host an event at TAG',
  description:
    'External hosts can submit a request to run an event at TAG in Amsterdam — talks, workshops, meetups, hackathons, launches.',
}

export default function HostEventPage() {
  return (
    <PageShell>
      <EventHostHero />
      <EventHostForm />
    </PageShell>
  )
}
