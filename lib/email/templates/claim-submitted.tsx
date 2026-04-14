import { H1, P } from './_components'
import { EmailLayout } from './_layout'

interface ClaimSubmittedProps {
  name?: string
}

export const ClaimSubmitted = ({ name }: ClaimSubmittedProps) => {
  return (
    <EmailLayout preview="We've received your AI/AM claim">
      <H1>{name ? `Thanks, ${name.split(' ')[0]}` : 'Thanks'} — claim received</H1>
      <P>
        We&apos;ve received your AI/AM membership claim. One of the TAG admins will
        review it and get back to you — usually within a couple of days.
      </P>
      <P>
        Once it&apos;s approved, your account will be upgraded to Builder automatically
        and you&apos;ll get a confirmation email.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default ClaimSubmitted
