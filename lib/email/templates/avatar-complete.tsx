import { Img } from '@react-email/components'

import { BRAND, EMAIL_PUBLIC_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface AvatarCompleteProps {
  name?: string
  imageUrl?: string
}

export const AvatarComplete = ({ name, imageUrl }: AvatarCompleteProps) => {
  return (
    <EmailLayout preview="Your TAG avatar is ready to confirm">
      <H1>
        {name ? `${name.split(' ')[0]}, your avatar is ready` : 'Your avatar is ready'}
      </H1>
      <P>
        Your generated TAG avatar is ready for review. Preview it and confirm to set
        it as your profile picture across the portal.
      </P>
      {imageUrl ? (
        <Img
          src={imageUrl}
          alt="Generated avatar"
          width="240"
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: `1px solid ${BRAND.colors.border}`,
            margin: '16px 0',
          }}
        />
      ) : null}
      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/profile`}>
        Review and confirm
      </PrimaryButton>
    </EmailLayout>
  )
}

export default AvatarComplete
