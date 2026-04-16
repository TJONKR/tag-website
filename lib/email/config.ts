export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'TAG <noreply@tag.space>'

// SITE_URL is the server's view of its own origin — used by auth/Stripe/etc.
// In local dev it is localhost, which is correct for those flows.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// EMAIL_PUBLIC_URL is the base for every URL we embed in outgoing mail — logos,
// buttons, footer links. It must always be a publicly reachable URL, never
// localhost or a preview deploy, because recipients open it from outside the
// server. Override with EMAIL_PUBLIC_URL env var if the canonical host moves.
export const EMAIL_PUBLIC_URL = process.env.EMAIL_PUBLIC_URL ?? 'https://www.tag.space'

export const BRAND = {
  name: 'TAG',
  tagline: 'To Achieve Greatness',
  logoUrl: `${EMAIL_PUBLIC_URL}/images/tag-logo-email.png`,
  // HSL values lifted from app/globals.css, flattened to hex for email clients
  // that don't support CSS custom properties.
  colors: {
    background: '#131110',
    foreground: '#efe6d9',
    primary: '#ff5b1f',
    primaryForeground: '#0f0c0a',
    muted: '#22201d',
    mutedForeground: '#9a918a',
    border: '#292724',
  },
} as const

export const adminRecipients = (): string[] => {
  const raw = process.env.EMAIL_ADMIN_RECIPIENTS ?? ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
