import { EMAIL_PUBLIC_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface SubscriptionCancelledProps {
  name?: string
  endsOn?: string
}

export const SubscriptionCancelled = ({ name, endsOn }: SubscriptionCancelledProps) => {
  return (
    <EmailLayout preview="Your TAG Builder membership has ended">
      <H1>{name ? `Thanks for being part of TAG, ${name.split(' ')[0]}` : 'Thanks for being part of TAG'}</H1>
      <P>
        Your Builder membership has been cancelled
        {endsOn ? ` and your access ends on ${endsOn}` : ''}. You&apos;ll stay on as an
        Ambassador — events and community access continue as normal.
      </P>
      <P>
        If you want to come back as a Builder later, it&apos;s one click from your
        profile.
      </P>
      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/profile`}>
        Manage membership
      </PrimaryButton>
      <P muted>
        If this wasn&apos;t you, reply to this email and we&apos;ll sort it.
      </P>
    </EmailLayout>
  )
}

export default SubscriptionCancelled
