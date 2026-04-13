import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'
import { ClaimList } from '@lib/membership/components'
import { getAiAmClaimsByStatus } from '@lib/membership/queries'
import { FadeIn, PortalHeader } from '@lib/portal/components'

export default async function AdminClaimsPage() {
  const user = await getUser()

  if (!user.is_super_admin) {
    redirect('/portal')
  }

  const initialClaims = await getAiAmClaimsByStatus('pending')

  return (
    <>
      <FadeIn>
        <PortalHeader
          title="AI/AM Claims"
          description="Approve or reject Builder claims from members who already pay AI AM directly."
        />
      </FadeIn>
      <FadeIn delay={75}>
        <ClaimList initialClaims={initialClaims} />
      </FadeIn>
    </>
  )
}
