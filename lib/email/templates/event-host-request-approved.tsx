import { EmailLayout } from './_layout'
import { H1, P } from './_components'

interface EventHostRequestApprovedProps {
  name: string
  eventTitle: string
}

export const EventHostRequestApproved = ({
  name,
  eventTitle,
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
      <P muted>See you in the space.</P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default EventHostRequestApproved
