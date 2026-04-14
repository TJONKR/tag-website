import { EmailLayout } from './_layout'
import { H1, P, PrimaryButton } from './_components'

interface ApplicationApprovedProps {
  name: string
  inviteUrl?: string
}

export const ApplicationApproved = ({ name, inviteUrl }: ApplicationApprovedProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="You're in — welcome to TAG">
      <H1>Welcome, {firstName}. You&apos;re in.</H1>
      <P>
        We&apos;ve reviewed your application and we&apos;d love to have you in the TAG
        community.
      </P>
      <P>
        You&apos;ll receive a separate email with a magic link to set up your account.
        Once you&apos;re in, finish your onboarding and you&apos;re good to go.
      </P>
      {inviteUrl ? (
        <PrimaryButton href={inviteUrl}>Set up your account</PrimaryButton>
      ) : null}
      <P muted>
        See you in the space.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default ApplicationApproved
