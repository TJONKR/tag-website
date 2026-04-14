import { Button as REButton, Heading, Section, Text } from '@react-email/components'
import type { CSSProperties, ReactNode } from 'react'

import { BRAND } from '../config'

interface HeadingProps {
  children: ReactNode
}

export const H1 = ({ children }: HeadingProps) => (
  <Heading as="h1" style={h1}>
    {children}
  </Heading>
)

export const H2 = ({ children }: HeadingProps) => (
  <Heading as="h2" style={h2}>
    {children}
  </Heading>
)

interface ParagraphProps {
  children: ReactNode
  muted?: boolean
}

export const P = ({ children, muted }: ParagraphProps) => (
  <Text style={muted ? pMuted : p}>{children}</Text>
)

interface PrimaryButtonProps {
  href: string
  children: ReactNode
}

export const PrimaryButton = ({ href, children }: PrimaryButtonProps) => (
  <Section style={buttonWrap}>
    <REButton href={href} style={button}>
      {children}
    </REButton>
  </Section>
)

interface CalloutProps {
  children: ReactNode
}

export const Callout = ({ children }: CalloutProps) => (
  <Section style={callout}>
    <Text style={calloutText}>{children}</Text>
  </Section>
)

const h1: CSSProperties = {
  color: BRAND.colors.foreground,
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: 1.25,
  margin: '0 0 16px',
}

const h2: CSSProperties = {
  color: BRAND.colors.foreground,
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: 1.3,
  margin: '28px 0 12px',
}

const p: CSSProperties = {
  color: BRAND.colors.foreground,
  fontSize: '15px',
  lineHeight: 1.6,
  margin: '0 0 14px',
}

const pMuted: CSSProperties = {
  color: BRAND.colors.mutedForeground,
  fontSize: '14px',
  lineHeight: 1.6,
  margin: '0 0 14px',
}

const buttonWrap: CSSProperties = {
  margin: '24px 0',
}

const button: CSSProperties = {
  backgroundColor: BRAND.colors.primary,
  color: BRAND.colors.primaryForeground,
  fontSize: '15px',
  fontWeight: 600,
  padding: '12px 22px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}

const callout: CSSProperties = {
  backgroundColor: BRAND.colors.muted,
  borderRadius: '8px',
  padding: '16px 18px',
  margin: '20px 0',
  border: `1px solid ${BRAND.colors.border}`,
}

const calloutText: CSSProperties = {
  color: BRAND.colors.foreground,
  fontSize: '14px',
  lineHeight: 1.5,
  margin: 0,
}
