import { EmailLayout } from './_layout'
import { Callout, H1, P, PrimaryButton } from './_components'
import { SITE_URL } from '../config'

interface ApplicationNewAdminProps {
  applicantName: string
  applicantEmail: string
  building: string
  whyTag: string
  referral?: string | null
}

export const ApplicationNewAdmin = ({
  applicantName,
  applicantEmail,
  building,
  whyTag,
  referral,
}: ApplicationNewAdminProps) => {
  return (
    <EmailLayout preview={`New TAG application: ${applicantName}`}>
      <H1>New application — {applicantName}</H1>
      <P muted>{applicantEmail}</P>

      <Callout>
        <strong>What they&apos;re building:</strong>
        <br />
        {building}
      </Callout>

      <Callout>
        <strong>Why TAG:</strong>
        <br />
        {whyTag}
      </Callout>

      {referral ? (
        <P muted>
          <strong>Referred by:</strong> {referral}
        </P>
      ) : null}

      <PrimaryButton href={`${SITE_URL}/portal/people?tab=applications`}>
        Review in portal
      </PrimaryButton>
    </EmailLayout>
  )
}

export default ApplicationNewAdmin
