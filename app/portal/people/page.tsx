import { getUser } from '@lib/auth/queries'
import { getMembers, getMemberCounts } from '@lib/people/queries'
import { getApplications, getApplicationCounts } from '@lib/applications/queries'
import { getAiAmClaimsByStatus } from '@lib/membership/queries'
import { FadeIn, PortalHeader } from '@lib/portal/components'
import { PeopleTabs } from '@lib/people/components'
import { InviteDialog } from '@lib/applications/components'

interface CommunityPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const user = await getUser()
  const isOperator = user.role === 'operator'
  const isSuperAdmin = user.is_super_admin ?? false
  const { tab } = await searchParams

  const [members, memberCounts, applications, applicationCounts, claims] = await Promise.all([
    getMembers(),
    getMemberCounts(),
    isOperator ? getApplications() : Promise.resolve([]),
    isOperator ? getApplicationCounts() : Promise.resolve({ pending: 0, accepted: 0, rejected: 0 }),
    isSuperAdmin ? getAiAmClaimsByStatus('pending') : Promise.resolve([]),
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
          actions={isOperator ? <InviteDialog /> : undefined}
        />
      </FadeIn>
      <FadeIn delay={75}>
        <PeopleTabs
          members={members}
          memberCounts={memberCounts}
          applications={applications}
          applicationCounts={applicationCounts}
          claims={claims}
          isOperator={isOperator}
          isSuperAdmin={isSuperAdmin}
          initialTab={tab}
        />
      </FadeIn>
    </>
  )
}
