import { SITE_URL } from '../config'
import { Divider, H1, LabeledSection, P, PrimaryButton } from './_components'
import { EmailLayout } from './_layout'

interface PaymentFailedProps {
  name?: string
  amountDue?: string
}

export const PaymentFailed = ({ name, amountDue }: PaymentFailedProps) => {
  return (
    <EmailLayout preview="Your TAG membership payment failed">
      <H1>{name ? `Hi ${name.split(' ')[0]},` : 'Heads up,'}</H1>
      <P>
        We weren&apos;t able to process your latest TAG membership payment
        {amountDue ? ` (${amountDue})` : ''}. This usually means an expired card,
        insufficient funds, or a bank-side hiccup.
      </P>

      <Divider />

      <LabeledSection label="What to do">
        Update your payment method in the billing portal. Stripe will retry automatically
        once it&apos;s fixed.
      </LabeledSection>

      <PrimaryButton href={`${SITE_URL}/portal/profile`}>
        Update payment method
      </PrimaryButton>
      <P muted>If you think this is a mistake, reply to this email.</P>
    </EmailLayout>
  )
}

export default PaymentFailed
