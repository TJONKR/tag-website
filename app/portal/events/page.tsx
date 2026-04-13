import { PortalHeader, FadeIn } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'
import {
  getAllUpcomingEvents,
  getAllPastEvents,
  getEventAttendanceSummary,
} from '@lib/events/queries'
import { PortalEventList } from '@lib/events/components/portal-event-list'

export default async function EventsPage() {
  const user = await getUser()
  const isAdmin = user.role === 'operator'
  const [upcoming, past] = await Promise.all([getAllUpcomingEvents(), getAllPastEvents()])

  // Fetch attendance summaries for past events (admin only)
  let attendanceSummaries: Record<string, { total: number; checkedIn: number }> | undefined
  if (isAdmin && past.length > 0) {
    const summaries = await Promise.all(
      past.map(async (event) => {
        const summary = await getEventAttendanceSummary(event.id)
        return [event.id, summary] as const
      })
    )
    attendanceSummaries = Object.fromEntries(summaries)
  }

  return (
    <>
      <FadeIn>
        <PortalHeader title="Events" description="Upcoming events, workshops and meetups at TAG." />
      </FadeIn>
      <FadeIn delay={75}>
        <PortalEventList
          upcoming={upcoming}
          past={past}
          isAdmin={isAdmin}
          attendanceSummaries={attendanceSummaries}
        />
      </FadeIn>
    </>
  )
}
