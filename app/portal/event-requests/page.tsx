import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'
import {
  getEventHostApplicationCounts,
  getEventHostApplications,
} from '@lib/event-applications/queries'
import { EventApplicationList } from '@lib/event-applications/components'
import { FadeIn, PortalHeader } from '@lib/portal/components'

interface EventRequestsPageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function EventRequestsPage({
  searchParams,
}: EventRequestsPageProps) {
  const user = await getUser()

  if (user.role !== 'operator') {
    redirect('/portal')
  }

  const { id } = await searchParams

  const [applications, counts] = await Promise.all([
    getEventHostApplications(),
    getEventHostApplicationCounts(),
  ])

  return (
    <>
      <FadeIn>
        <PortalHeader
          title="Event requests"
          description="Review external event-host requests submitted via /host-event."
        />
      </FadeIn>
      <FadeIn delay={75}>
        <EventApplicationList
          initialApplications={applications}
          initialCounts={counts}
          initialSelectedId={id ?? null}
        />
      </FadeIn>
    </>
  )
}
