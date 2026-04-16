import { EMAIL_PUBLIC_URL } from '../config'
import { Divider, H1, LabeledSection, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface ClaimApprovedProps {
  name?: string
}

export const ClaimApproved = ({ name }: ClaimApprovedProps) => {
  return (
    <EmailLayout preview="Your AI/AM claim is approved">
      <H1>{name ? `You're in, ${name.split(' ')[0]}` : 'Your claim is approved'}</H1>
      <P>
        Your AI/AM membership claim has been approved. Your TAG account has been
        upgraded to <strong>Builder</strong>.
      </P>

      <Divider />

      <LabeledSection label="What you get">
        Full access to the TAG space, events, and Builder-only perks.
      </LabeledSection>

      <PrimaryButton href={`${EMAIL_PUBLIC_URL}/portal/profile`}>
        Go to your profile
      </PrimaryButton>
    </EmailLayout>
  )
}

export default ClaimApproved
