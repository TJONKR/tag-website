import { PortalHeader, FadeIn } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'
import {
  getAllUpcomingEvents,
  getAllPastEvents,
  getEventAttendanceCount,
} from '@lib/events/queries'
import { PortalEventList } from '@lib/events/components/portal-event-list'
import { EventAdminActions } from '@lib/events/components/event-admin-actions'
import {
  getEventHostApplications,
  getEventHostApplicationCounts,
} from '@lib/event-applications/queries'
import type {
  EventHostApplication,
  EventApplicationCounts,
} from '@lib/event-applications/types'

export default async function EventsPage() {
  const user = await getUser()
  const isAdmin = user.role === 'operator'
  const [upcoming, past] = await Promise.all([getAllUpcomingEvents(), getAllPastEvents()])

  // Fetch attendance counts for past events (admin only)
  let attendanceCounts: Record<string, number> | undefined
  if (isAdmin && past.length > 0) {
    const counts = await Promise.all(
      past.map(async (event) => {
        const count = await getEventAttendanceCount(event.id)
        return [event.id, count] as const
      })
    )
    attendanceCounts = Object.fromEntries(counts)
  }

  let hostRequests: EventHostApplication[] | undefined
  let hostRequestCounts: EventApplicationCounts | undefined
  if (isAdmin) {
    ;[hostRequests, hostRequestCounts] = await Promise.all([
      getEventHostApplications(),
      getEventHostApplicationCounts(),
    ])
  }

  return (
    <>
      <FadeIn>
        <PortalHeader
          title="Events"
          description="Upcoming events, workshops and meetups at TAG."
          actions={isAdmin ? <EventAdminActions /> : undefined}
        />
      </FadeIn>
      <FadeIn delay={75}>
        <PortalEventList
          upcoming={upcoming}
          past={past}
          isAdmin={isAdmin}
          attendanceCounts={attendanceCounts}
          hostRequests={hostRequests}
          hostRequestCounts={hostRequestCounts}
        />
      </FadeIn>
    </>
  )
}
