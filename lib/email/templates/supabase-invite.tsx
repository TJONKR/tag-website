import { EmailLayout } from './_layout'
import { H1, P, PrimaryButton } from './_components'

/**
 * Source for Supabase's "Invite user" email template. See the sibling
 * supabase-*.tsx files for the full explanation.
 *
 * Regenerate HTML with: pnpm render-auth-emails
 */
export const SupabaseInvite = () => {
  return (
    <EmailLayout preview="You've been invited to TAG">
      <H1>You&apos;re invited to TAG</H1>
      <P>
        Someone at TAG invited you to join the community. Accept below to set a
        password and create your account.
      </P>
      <PrimaryButton href="{{ .ConfirmationURL }}">Accept invitation</PrimaryButton>
      <P muted>
        If you weren&apos;t expecting this, you can ignore the email and no
        account will be created.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

export default SupabaseInvite
