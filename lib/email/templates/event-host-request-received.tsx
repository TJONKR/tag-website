import { EmailLayout } from './_layout'
import { H1, P } from './_components'

interface EventHostRequestReceivedProps {
  name: string
  eventTitle: string
}

export const EventHostRequestReceived = ({
  name,
  eventTitle,
}: EventHostRequestReceivedProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="We've received your event request">
      <H1>Thanks, {firstName} — we got your request</H1>
      <P>
        We&apos;ve received your request to host &ldquo;{eventTitle}&rdquo; at TAG.
        One of us will review it in the next few days and get back to you personally.
      </P>
      <P muted>
        We say yes to events that fit the house: builder energy, craft over hype,
        small enough to actually talk. If the fit is there, we&apos;ll reply with
        next steps (date confirmation, setup, AV, house rules).
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default EventHostRequestReceived
