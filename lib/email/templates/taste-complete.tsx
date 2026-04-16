import { EMAIL_PUBLIC_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface TasteCompleteProps {
  name?: string
}

export const TasteComplete = ({ name }: TasteCompleteProps) => {
  return (
    <EmailLayout preview="Your TAG Taste profile is live">
      <H1>
        {name ? `${name.split(' ')[0]}, your Taste profile is live` : 'Your Taste profile is live'}
      </H1>
      <P>
        The TAG research pipeline finished enriching your profile. It&apos;s now
        visible to the rest of the community — and it&apos;s how other members can
        find out what you&apos;re working on.
      </P>
      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/taste`}>
        View your profile
      </PrimaryButton>
      <P muted>
        You can edit visibility per section from the Taste page.
      </P>
    </EmailLayout>
  )
}

export default TasteComplete
