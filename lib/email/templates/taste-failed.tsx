import { EMAIL_PUBLIC_URL } from '../config'
import { Divider, H1, LabeledSection, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface TasteFailedProps {
  name?: string
  errorMessage?: string
}

export const TasteFailed = ({ name, errorMessage }: TasteFailedProps) => {
  return (
    <EmailLayout preview="Your Taste profile generation failed">
      <H1>{name ? `${name.split(' ')[0]}, we hit a snag` : 'We hit a snag'}</H1>
      <P>
        The Taste profile pipeline wasn&apos;t able to finish. This usually means one
        of the research agents couldn&apos;t reach a source, or a link was
        unreachable.
      </P>

      {errorMessage ? (
        <>
          <Divider />
          <LabeledSection label="Error details">{errorMessage}</LabeledSection>
        </>
      ) : null}

      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/profile?tab=identity`}>
        View your profile
      </PrimaryButton>
      <P muted>If it keeps failing, reply to this email and we&apos;ll debug together.</P>
    </EmailLayout>
  )
}

export default TasteFailed
