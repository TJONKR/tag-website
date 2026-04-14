import { SITE_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface ClaimNewAdminProps {
  userName?: string
  userEmail: string
}

export const ClaimNewAdmin = ({ userName, userEmail }: ClaimNewAdminProps) => {
  return (
    <EmailLayout preview={`New AI/AM claim: ${userName ?? userEmail}`}>
      <H1>New AI/AM claim</H1>
      <P>
        <strong>{userName ?? userEmail}</strong> ({userEmail}) submitted an AI/AM
        membership claim. Review it in the admin portal to approve, reject, or request
        more info.
      </P>
      <PrimaryButton href={`${SITE_URL}/portal/admin/claims`}>
        Review claim
      </PrimaryButton>
    </EmailLayout>
  )
}

export default ClaimNewAdmin
