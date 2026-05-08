import { EmailLayout } from './_layout'
import { H1, P } from './_components'

interface EventHostRequestRejectedProps {
  name: string
  eventTitle: string
}

export const EventHostRequestRejected = ({
  name,
  eventTitle,
}: EventHostRequestRejectedProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="An update on your TAG event request">
      <H1>Hi {firstName},</H1>
      <P>
        Thanks for reaching out about hosting &ldquo;{eventTitle}&rdquo; at TAG.
        After reviewing your request, we&apos;re not able to host it right now.
      </P>
      <P>
        This isn&apos;t a judgement on your event. We&apos;re a small space with
        a specific vibe and limited calendar slots, so we have to be selective.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default EventHostRequestRejected
