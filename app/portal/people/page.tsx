import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'
import { getMembers, getMemberCounts } from '@lib/people/queries'
import { getApplications, getApplicationCounts } from '@lib/applications/queries'
import { FadeIn, PortalHeader } from '@lib/portal/components'
import { PeopleTabs } from '@lib/people/components'

export default async function PeoplePage() {
  const user = await getUser()

  if (user.role !== 'operator') {
    redirect('/portal/events')
  }

  const [members, memberCounts, applications, applicationCounts] = await Promise.all([
    getMembers(),
    getMemberCounts(),
    getApplications(),
    getApplicationCounts(),
  ])

  return (
    <>
      <FadeIn>
        <PortalHeader title="People" description="Manage members and review applications." />
      </FadeIn>
      <FadeIn delay={75}>
        <PeopleTabs
          members={members}
          memberCounts={memberCounts}
          applications={applications}
          applicationCounts={applicationCounts}
        />
      </FadeIn>
    </>
  )
}
