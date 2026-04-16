import { EmailLayout } from './_layout'
import { H1, P, PrimaryButton } from './_components'

interface ApplicationApprovedProps {
  name: string
  signupUrl: string
}

export const ApplicationApproved = ({ name, signupUrl }: ApplicationApprovedProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="You're in — welcome to TAG">
      <H1>Welcome, {firstName}. You&apos;re in.</H1>
      <P>
        We&apos;ve reviewed your application and we&apos;d love to have you in the TAG
        community.
      </P>
      <P>
        Click below to set up your account. Use the same email you applied with.
      </P>
      <PrimaryButton href={signupUrl}>Create your account</PrimaryButton>
      <P muted>
        See you in the space.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default ApplicationApproved
