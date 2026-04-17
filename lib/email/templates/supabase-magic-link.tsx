import { EmailLayout } from './_layout'
import { H1, P, PrimaryButton } from './_components'

/**
 * Source for Supabase's "Magic link" email template. See the sibling
 * supabase-*.tsx files for the full explanation.
 *
 * Regenerate HTML with: pnpm render-auth-emails
 */
export const SupabaseMagicLink = () => {
  return (
    <EmailLayout preview="Your TAG sign-in link">
      <H1>Sign in to TAG</H1>
      <P>
        Click the button below to sign in. The link will open your account and
        expires in one hour.
      </P>
      <PrimaryButton href="{{ .ConfirmationURL }}">Sign in to TAG</PrimaryButton>
      <P muted>
        If you didn&apos;t ask for this link, you can safely ignore this email.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default SupabaseMagicLink
