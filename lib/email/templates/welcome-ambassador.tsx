import { SITE_URL } from '../config'
import { Callout, H1, H2, P, PrimaryButton } from './_components'
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

      <H2>A few things to try</H2>
      <Callout>
        <strong>Come to an event.</strong> Check the portal calendar and RSVP via Luma.
        Showing up gets you lootbox drops.
      </Callout>
      <Callout>
        <strong>Set up your profile.</strong> Your Taste profile is how the rest of TAG
        finds out what you&apos;re working on.
      </Callout>
      <Callout>
        <strong>Ship something.</strong> That&apos;s the whole point.
      </Callout>

      <PrimaryButton href={`${SITE_URL}/portal`}>Go to the portal</PrimaryButton>

      <P muted>
        Questions? Reply to this email — it goes straight to the team.
      </P>
    </EmailLayout>
  )
}

export default WelcomeAmbassador
