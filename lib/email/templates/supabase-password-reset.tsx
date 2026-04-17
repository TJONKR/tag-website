import { EmailLayout } from './_layout'
import { H1, P, PrimaryButton } from './_components'

/**
 * Source for Supabase's "Reset password" email template. This is NOT sent by
 * our server — it is rendered to static HTML and pasted into the Supabase
 * Dashboard (Authentication → Email Templates). Supabase substitutes
 * `{{ .ConfirmationURL }}` at send time.
 *
 * Regenerate HTML with: pnpm render-auth-emails
 */
export const SupabasePasswordReset = () => {
  return (
    <EmailLayout preview="Reset your TAG password">
      <H1>Reset your password</H1>
      <P>
        We got a request to reset the password for your TAG account. Click below
        to choose a new one. The link is good for one hour.
      </P>
      <PrimaryButton href="{{ .ConfirmationURL }}">Reset password</PrimaryButton>
      <P muted>
        If you didn&apos;t request this, nothing will change — you can safely
        ignore this email.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default SupabasePasswordReset
