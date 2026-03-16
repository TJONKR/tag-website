import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'
import { getMembers, getMemberCounts } from '@lib/people/queries'
import { getApplications, getApplicationCounts } from '@lib/applications/queries'
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
    <div className="space-y-8">
      <div>
        <h1 className="font-syne text-2xl font-bold text-tag-text">People</h1>
        <p className="mt-1 font-grotesk text-sm text-tag-muted">
          Manage members and review applications.
        </p>
      </div>
      <PeopleTabs
        members={members}
        memberCounts={memberCounts}
        applications={applications}
        applicationCounts={applicationCounts}
      />
    </div>
  )
}
