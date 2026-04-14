import { Callout, H1, P } from './_components'
import { EmailLayout } from './_layout'

interface ContractSignedProps {
  representativeName: string
  companyName: string
  signedOn: string
}

export const ContractSigned = ({
  representativeName,
  companyName,
  signedOn,
}: ContractSignedProps) => {
  const firstName = representativeName.split(' ')[0]

  return (
    <EmailLayout preview="Your TAG membership contract is signed">
      <H1>Your contract is signed, {firstName}</H1>
      <P>
        Thanks for completing your TAG membership agreement on behalf of{' '}
        <strong>{companyName}</strong>. A signed PDF copy is attached to this email for
        your records.
      </P>
      <Callout>
        Signed on {signedOn}. Keep this email — it&apos;s your reference copy.
      </Callout>
      <P muted>
        If anything in the contract needs adjusting, reply to this email and we&apos;ll
        sort it.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default ContractSigned
