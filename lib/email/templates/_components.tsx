import { Button as REButton, Heading, Hr, Section, Text } from '@react-email/components'
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

interface LabelProps {
  children: ReactNode
}

export const Label = ({ children }: LabelProps) => <Text style={label}>{children}</Text>

interface LabeledSectionProps {
  label: string
  children: ReactNode
}

export const LabeledSection = ({ label: labelText, children }: LabeledSectionProps) => (
  <>
    <Text style={label}>{labelText}</Text>
    <Text style={labeledBody}>{children}</Text>
  </>
)

export const Divider = () => <Hr style={divider} />

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
  fontSize: '14px',
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
  padding: '14px 28px',
  borderRadius: 0,
  textDecoration: 'none',
  display: 'inline-block',
  lineHeight: '120%',
}

const label: CSSProperties = {
  color: BRAND.colors.mutedForeground,
  fontSize: '12px',
  lineHeight: 1,
  margin: '0 0 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const labeledBody: CSSProperties = {
  color: BRAND.colors.foreground,
  fontSize: '14px',
  lineHeight: 1.6,
  margin: 0,
}

const divider: CSSProperties = {
  border: 'none',
  borderTop: `1px solid ${BRAND.colors.border}`,
  margin: '24px 0',
}
