import { Divider, H1, LabeledSection, P } from './_components'
import { EmailLayout } from './_layout'

interface ClaimRevokedProps {
  name?: string
  notes?: string
  keptBuilderViaStripe?: boolean
}

export const ClaimRevoked = ({ name, notes, keptBuilderViaStripe }: ClaimRevokedProps) => {
  return (
    <EmailLayout preview="Your AI/AM claim has been revoked">
      <H1>{name ? `Hi ${name.split(' ')[0]},` : 'Hi,'}</H1>
      <P>
        Your AI/AM membership claim has been revoked.
        {keptBuilderViaStripe
          ? ' Because you have an active direct Builder subscription, your TAG role stays on Builder.'
          : ' Your TAG role has been moved back to Ambassador.'}
      </P>

      {notes ? (
        <>
          <Divider />
          <LabeledSection label="Note from the admin team">{notes}</LabeledSection>
        </>
      ) : null}

      <P muted>Questions? Reply to this email and we&apos;ll get back to you.</P>
    </EmailLayout>
  )
}

export default ClaimRevoked
