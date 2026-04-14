import { EmailLayout } from './_layout'
import { H1, P } from './_components'

interface ApplicationRejectedProps {
  name: string
}

export const ApplicationRejected = ({ name }: ApplicationRejectedProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="An update on your TAG application">
      <H1>Hi {firstName},</H1>
      <P>
        Thanks for applying to join TAG. We&apos;ve spent time reading your application,
        and after careful consideration we&apos;re not able to offer you a spot in the
        community right now.
      </P>
      <P>
        This isn&apos;t a judgement on the work you&apos;re doing — TAG is a small,
        deliberately curated group and fit is everything. We hope our paths cross again.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default ApplicationRejected
