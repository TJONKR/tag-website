import { EMAIL_PUBLIC_URL } from '../config'
import { Divider, H1, LabeledSection, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface WelcomeAmbassadorProps {
  name: string
}

export const WelcomeAmbassador = ({ name }: WelcomeAmbassadorProps) => {
  const firstName = name.split(' ')[0]

  return (
    <EmailLayout preview="Welcome to TAG — here's what's next">
      <H1>Welcome to TAG, {firstName}</H1>
      <P>
        You&apos;re officially in as an <strong>Ambassador</strong>. That means access to
        the portal, the space, and the community.
      </P>

      <Divider />

      <LabeledSection label="Come to an event">
        Check the portal calendar and RSVP via Luma. Showing up gets you lootbox drops.
      </LabeledSection>

      <Divider />

      <LabeledSection label="Set up your profile">
        Your Taste profile is how the rest of TAG finds out what you&apos;re working on.
      </LabeledSection>

      <Divider />

      <LabeledSection label="Ship something">
        That&apos;s the whole point.
      </LabeledSection>

      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal`}>Go to the portal</PrimaryButton>

      <P muted>Questions? Reply to this email — it goes straight to the team.</P>
    </EmailLayout>
  )
}

export default WelcomeAmbassador
