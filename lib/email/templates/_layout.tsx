import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'

import { BRAND, EMAIL_PUBLIC_URL } from '../config'

interface EmailLayoutProps {
  preview: string
  children: ReactNode
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img src={BRAND.logoUrl} alt={BRAND.name} width="80" style={headerLogo} />
            <Text style={headerTagline}>{BRAND.tagline}</Text>
          </Section>

          <Section style={content}>{children}</Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              {BRAND.name} —{' '}
              <Link href={EMAIL_PUBLIC_URL} style={footerLink}>
                tag.space
              </Link>
            </Text>
            <Text style={footerSmall}>
              You received this because you&apos;re part of the TAG community.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: BRAND.colors.background,
  color: BRAND.colors.foreground,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  margin: 0,
  padding: 0,
}

const container = {
  backgroundColor: BRAND.colors.background,
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 24px',
}

const header = {
  paddingBottom: '32px',
}

const headerLogo = {
  display: 'block',
  border: 0,
  outline: 'none',
}

const headerTagline = {
  color: BRAND.colors.mutedForeground,
  fontSize: '13px',
  lineHeight: '24px',
  margin: '8px 0 0',
}

const content = {
  color: BRAND.colors.foreground,
}

const divider = {
  border: 'none',
  borderTop: `1px solid ${BRAND.colors.border}`,
  margin: '40px 0 24px',
}

const footer = {
  color: BRAND.colors.mutedForeground,
}

const footerText = {
  color: BRAND.colors.mutedForeground,
  fontSize: '13px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const footerLink = {
  color: BRAND.colors.primary,
  textDecoration: 'none',
}

const footerSmall = {
  color: BRAND.colors.mutedForeground,
  fontSize: '11px',
  lineHeight: '24px',
  margin: 0,
}
