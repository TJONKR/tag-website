import { EmailLayout } from './_layout'
import { Divider, H1, LabeledSection, P } from './_components'

interface EventHostRequestApprovedProps {
  name: string
  eventTitle: string
  adminNotes?: string | null
}

export const EventHostRequestApproved = ({
  name,
  eventTitle,
  adminNotes,
}: EventHostRequestApprovedProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="Your TAG event request is approved">
      <H1>Good news, {firstName} — we&apos;d love to host {eventTitle}</H1>
      <P>
        We&apos;ve reviewed your request and it&apos;s a good fit for TAG.
        One of us will be in touch shortly to confirm the date, the setup, and
        the house rules. You can reply to this email with any questions.
      </P>

      {adminNotes ? (
        <>
          <Divider />
          <LabeledSection label="Notes from the team">{adminNotes}</LabeledSection>
        </>
      ) : null}

      <P muted>See you in the space.</P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default EventHostRequestApproved
