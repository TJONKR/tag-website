import { SITE_URL } from '../config'
import { H1, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface SkinFailedProps {
  name?: string
}

export const SkinFailed = ({ name }: SkinFailedProps) => {
  return (
    <EmailLayout preview="Your TAG skin generation hit a snag">
      <H1>
        {name ? `${name.split(' ')[0]}, your skin didn't generate` : 'Your skin didn\'t generate'}
      </H1>
      <P>
        Something went wrong while generating your TAG skin. This is usually a
        temporary blip with the image pipeline — one retry is all it takes.
      </P>
      <PrimaryButton href={`${SITE_URL}/portal/profile`}>
        Retry generation
      </PrimaryButton>
      <P muted>
        If retrying doesn&apos;t work, reply to this email and we&apos;ll have a look.
      </P>
    </EmailLayout>
  )
}

export default SkinFailed
