import { PageShell } from '@components/page-shell'
import { EventHostForm, EventHostHero } from '@lib/event-applications/components'
import { SpacePhotosGallery } from '@lib/space-photos/components'
import { getSpacePhotos } from '@lib/space-photos/queries'

export const metadata = {
  title: 'Host an event at TAG',
  description:
    'External hosts can submit a request to run an event at TAG in Amsterdam — talks, workshops, meetups, hackathons, launches.',
}

export default async function HostEventPage() {
  const photos = await getSpacePhotos()

  return (
    <PageShell>
      <EventHostHero />
      <SpacePhotosGallery photos={photos} />
      <EventHostForm />
    </PageShell>
  )
}
