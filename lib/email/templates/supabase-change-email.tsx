import { EmailLayout } from './_layout'
import { H1, P, PrimaryButton } from './_components'

/**
 * Source for Supabase's "Change email address" template. See the sibling
 * supabase-*.tsx files for the full explanation. Supabase substitutes
 * `{{ .Email }}` (old address) and `{{ .NewEmail }}` alongside
 * `{{ .ConfirmationURL }}`.
 *
 * Regenerate HTML with: pnpm render-auth-emails
 */
export const SupabaseChangeEmail = () => {
  return (
    <EmailLayout preview="Confirm your new TAG email">
      <H1>Confirm your new email</H1>
      <P>
        You asked to change your TAG email from{' '}
        <strong>{'{{ .Email }}'}</strong> to{' '}
        <strong>{'{{ .NewEmail }}'}</strong>. Click below to confirm the change.
      </P>
      <PrimaryButton href="{{ .ConfirmationURL }}">Confirm new email</PrimaryButton>
      <P muted>
        If you didn&apos;t request this, you can ignore the email — nothing will
        change until the link is clicked.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default SupabaseChangeEmail
