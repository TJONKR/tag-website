import { EMAIL_PUBLIC_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface SubscriptionActiveProps {
  name?: string
}

export const SubscriptionActive = ({ name }: SubscriptionActiveProps) => {
  return (
    <EmailLayout preview="You're now a TAG Builder">
      <H1>{name ? `Welcome to Builder, ${name.split(' ')[0]}` : 'Welcome to Builder'}</H1>
      <P>
        Your membership is active. You now have full access to the TAG space, events,
        and the Builder tier of the community.
      </P>
      <P>
        A billing receipt will follow from Stripe shortly. You can manage your
        subscription any time from your profile.
      </P>
      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/profile`}>
        Go to your profile
      </PrimaryButton>
      <P muted>Shipping hard. — Team TAG</P>
    </EmailLayout>
  )
}

export default SubscriptionActive
