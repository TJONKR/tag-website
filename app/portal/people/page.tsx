import { getUser } from '@lib/auth/queries'
import { getMembers, getMemberCounts } from '@lib/people/queries'
import { getApplications, getApplicationCounts } from '@lib/applications/queries'
import { FadeIn, PortalHeader } from '@lib/portal/components'
import { PeopleTabs } from '@lib/people/components'

export default async function CommunityPage() {
  const user = await getUser()
  const isOperator = user.role === 'operator'

  const [members, memberCounts, applications, applicationCounts] = await Promise.all([
    getMembers(),
    getMemberCounts(),
    isOperator ? getApplications() : Promise.resolve([]),
    isOperator ? getApplicationCounts() : Promise.resolve({ pending: 0, accepted: 0, rejected: 0 }),
  ])

  return (
    <>
      <FadeIn>
        <PortalHeader
          title="Community"
          description={
            isOperator
              ? 'Manage members and review applications.'
              : 'See who is part of the community.'
          }
        />
      </FadeIn>
      <FadeIn delay={75}>
        <PeopleTabs
          members={members}
          memberCounts={memberCounts}
          applications={applications}
          applicationCounts={applicationCounts}
          isOperator={isOperator}
        />
      </FadeIn>
    </>
  )
}
