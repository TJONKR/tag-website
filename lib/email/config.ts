export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'TAG <noreply@tag.space>'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const BRAND = {
  name: 'TAG',
  tagline: 'To Achieve Greatness',
  logoUrl: `${SITE_URL}/images/tag-logo-email.png`,
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
