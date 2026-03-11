import { PortalHeader } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'
import { getAllUpcomingEvents, getAllPastEvents } from '@lib/events/queries'
import { PortalEventList } from '@lib/events/components/portal-event-list'

export default async function EventsPage() {
  const user = await getUser()
  const [upcoming, past] = await Promise.all([getAllUpcomingEvents(), getAllPastEvents()])

  return (
    <>
      <PortalHeader title="Events" description="Upcoming events, workshops and meetups at TAG." />
      <PortalEventList upcoming={upcoming} past={past} isAdmin={user.role === 'operator'} />
    </>
  )
}
