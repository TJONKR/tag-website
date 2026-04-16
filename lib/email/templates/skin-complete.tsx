import { Img } from '@react-email/components'

import { BRAND, EMAIL_PUBLIC_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface SkinCompleteProps {
  name?: string
  skinName?: string
  rarity?: string
  imageUrl?: string
}

export const SkinComplete = ({ name, skinName, rarity, imageUrl }: SkinCompleteProps) => {
  return (
    <EmailLayout preview="Your TAG skin is ready">
      <H1>
        {name ? `${name.split(' ')[0]}, your skin is ready` : 'Your skin is ready'}
      </H1>
      <P>
        The TAG skin you picked from your lootbox has finished generating.
        {skinName ? (
          <>
            {' '}
            You now own <strong>{skinName}</strong>
            {rarity ? ` (${rarity})` : ''}.
          </>
        ) : null}
      </P>
      {imageUrl ? (
        <Img
          src={imageUrl}
          alt={skinName ?? 'Your TAG skin'}
          width="480"
          style={{
            maxWidth: '100%',
            borderRadius: '8px',
            border: `1px solid ${BRAND.colors.border}`,
            margin: '16px 0',
          }}
        />
      ) : null}
      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/profile`}>
        See it on your profile
      </PrimaryButton>
    </EmailLayout>
  )
}

export default SkinComplete
