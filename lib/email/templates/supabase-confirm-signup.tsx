import { EmailLayout } from './_layout'
import { H1, P, PrimaryButton } from './_components'

/**
 * Source for Supabase's "Confirm signup" email template. This is NOT sent by
 * our server — it is rendered to static HTML and pasted into the Supabase
 * Dashboard (Authentication → Email Templates). Supabase substitutes
 * `{{ .ConfirmationURL }}` at send time.
 *
 * Regenerate HTML with: pnpm render-auth-emails
 */
export const SupabaseConfirmSignup = () => {
  return (
    <EmailLayout preview="Confirm your TAG account">
      <H1>Confirm your email</H1>
      <P>
        Welcome to TAG. Click the button below to confirm your email address and
        finish creating your account.
      </P>
      <PrimaryButton href="{{ .ConfirmationURL }}">Confirm email</PrimaryButton>
      <P muted>
        If you didn&apos;t create a TAG account, you can ignore this message.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default SupabaseConfirmSignup
