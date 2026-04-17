import { Section, Text } from '@react-email/components'

import { BRAND } from '../config'
import { EmailLayout } from './_layout'
import { H1, P } from './_components'

/**
 * Source for Supabase's "Reauthentication" template. Supabase substitutes
 * `{{ .Token }}` with a 6-digit code. Unlike the other auth emails, this one
 * has no click-through — the user copies the code.
 *
 * Regenerate HTML with: pnpm render-auth-emails
 */
export const SupabaseReauthentication = () => {
  return (
    <EmailLayout preview="Your TAG confirmation code">
      <H1>Confirm it&apos;s you</H1>
      <P>
        To finish the action you just requested, enter this code in TAG. The
        code is good for a few minutes.
      </P>
      <Section style={codeWrap}>
        <Text style={code}>{'{{ .Token }}'}</Text>
      </Section>
      <P muted>
        If you didn&apos;t request this, ignore the email and consider changing
        your password.
      </P>
      <P>— Team TAG</P>
    </EmailLayout>
  )
}

const codeWrap = {
  backgroundColor: BRAND.colors.muted,
  border: `1px solid ${BRAND.colors.border}`,
  padding: '20px 24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const code = {
  color: BRAND.colors.foreground,
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '0.2em',
  lineHeight: 1,
  margin: 0,
}

export default SupabaseReauthentication
