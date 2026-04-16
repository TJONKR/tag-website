import { EMAIL_PUBLIC_URL } from '../config'
import { Divider, H1, LabeledSection, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

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

      <LabeledSection label="What they're building">{building}</LabeledSection>

      <Divider />

      <LabeledSection label="Why TAG">{whyTag}</LabeledSection>

      {referral ? (
        <>
          <Divider />
          <LabeledSection label="Referred by">{referral}</LabeledSection>
        </>
      ) : null}

      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/people?tab=applications`}>
        Review in portal
      </PrimaryButton>
    </EmailLayout>
  )
}

export default ApplicationNewAdmin
