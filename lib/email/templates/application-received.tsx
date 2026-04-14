import { EmailLayout } from './_layout'
import { H1, P } from './_components'

interface ApplicationReceivedProps {
  name: string
}

export const ApplicationReceived = ({ name }: ApplicationReceivedProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="We've received your TAG application">
      <H1>Thanks, {firstName} — we got your application</H1>
      <P>
        We&apos;ve received your application to join TAG. A few of us will read it over the
        coming days and get back to you personally, one way or the other.
      </P>
      <P muted>
        In the meantime, feel free to keep shipping. That&apos;s the vibe around here.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default ApplicationReceived
