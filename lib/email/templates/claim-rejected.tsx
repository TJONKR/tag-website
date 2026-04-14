import { Callout, H1, P } from './_components'
import { EmailLayout } from './_layout'

interface ClaimRejectedProps {
  name?: string
  notes?: string
}

export const ClaimRejected = ({ name, notes }: ClaimRejectedProps) => {
  return (
    <EmailLayout preview="An update on your AI/AM claim">
      <H1>{name ? `Hi ${name.split(' ')[0]},` : 'Hi,'}</H1>
      <P>
        We&apos;ve reviewed your AI/AM membership claim and we&apos;re not able to
        approve it at this time.
      </P>
      {notes ? (
        <Callout>
          <strong>Note from the admin team:</strong>
          <br />
          {notes}
        </Callout>
      ) : null}
      <P>
        If you think this was a mistake or the situation changes, reply to this email
        and we&apos;ll take another look.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default ClaimRejected
