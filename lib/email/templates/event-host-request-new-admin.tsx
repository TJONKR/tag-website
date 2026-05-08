import { EMAIL_PUBLIC_URL } from '../config'
import { Divider, H1, LabeledSection, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface EventHostRequestNewAdminProps {
  id: string
  applicantName: string
  applicantEmail: string
  eventTitle: string
  eventType: string
  description: string
  expectedAttendees: number | null
  proposedDate: string | null
  proposedDateFlexible: boolean
  organization: string | null
  websiteUrl: string | null
  socialUrl: string | null
}

export const EventHostRequestNewAdmin = ({
  id,
  applicantName,
  applicantEmail,
  eventTitle,
  eventType,
  description,
  expectedAttendees,
  proposedDate,
  proposedDateFlexible,
  organization,
  websiteUrl,
  socialUrl,
}: EventHostRequestNewAdminProps) => {
  const dateLabel = proposedDate
    ? `${proposedDate}${proposedDateFlexible ? ' (flexible)' : ''}`
    : proposedDateFlexible
      ? 'Flexible'
      : null

  return (
    <EmailLayout preview={`New event request: ${eventTitle}`}>
      <H1>New event request — {eventTitle}</H1>
      <P muted>
        From {applicantName} &lt;{applicantEmail}&gt;
        {organization ? ` · ${organization}` : ''}
      </P>

      <LabeledSection label="Type">{eventType}</LabeledSection>

      {expectedAttendees !== null ? (
        <>
          <Divider />
          <LabeledSection label="Expected attendees">
            {String(expectedAttendees)}
          </LabeledSection>
        </>
      ) : null}

      {dateLabel ? (
        <>
          <Divider />
          <LabeledSection label="Proposed date">{dateLabel}</LabeledSection>
        </>
      ) : null}

      <Divider />
      <LabeledSection label="Description">{description}</LabeledSection>

      {websiteUrl ? (
        <>
          <Divider />
          <LabeledSection label="Website">{websiteUrl}</LabeledSection>
        </>
      ) : null}

      {socialUrl ? (
        <>
          <Divider />
          <LabeledSection label="Social">{socialUrl}</LabeledSection>
        </>
      ) : null}

      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/event-requests?id=${id}`}>
        Review in portal
      </PrimaryButton>
    </EmailLayout>
  )
}

export default EventHostRequestNewAdmin
