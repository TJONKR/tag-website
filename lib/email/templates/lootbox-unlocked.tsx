import { EMAIL_PUBLIC_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface LootboxUnlockedProps {
  name?: string
  eventTitle: string
}

export const LootboxUnlocked = ({ name, eventTitle }: LootboxUnlockedProps) => {
  return (
    <EmailLayout preview={`You unlocked a lootbox at ${eventTitle}`}>
      <H1>
        {name ? `Nice one, ${name.split(' ')[0]}` : 'Nice one'} — you unlocked a lootbox
      </H1>
      <P>
        Thanks for showing up to <strong>{eventTitle}</strong>. You&apos;ve earned a
        lootbox with four TAG skin cards inside. Pick one and it becomes yours forever.
      </P>
      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/profile`}>
        Open your lootbox
      </PrimaryButton>
      <P muted>
        The more events you attend, the more lootboxes you get. Stack them up.
      </P>
    </EmailLayout>
  )
}

export default LootboxUnlocked
