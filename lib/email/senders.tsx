import { sendEmail, type SendEmailResult } from './send'
import { getAdminRecipients, getUserEmail } from './recipients'
import { ApplicationReceived } from './templates/application-received'
import { ApplicationNewAdmin } from './templates/application-new-admin'
import { ApplicationApproved } from './templates/application-approved'
import { ApplicationRejected } from './templates/application-rejected'
import { WelcomeAmbassador } from './templates/welcome-ambassador'
import { SubscriptionActive } from './templates/subscription-active'
import { PaymentFailed } from './templates/payment-failed'
import { SubscriptionCancelled } from './templates/subscription-cancelled'
import { ContractSigned } from './templates/contract-signed'
import { ClaimSubmitted } from './templates/claim-submitted'
import { ClaimNewAdmin } from './templates/claim-new-admin'
import { ClaimApproved } from './templates/claim-approved'
import { ClaimRejected } from './templates/claim-rejected'
import { ClaimRevoked } from './templates/claim-revoked'
import { LootboxUnlocked } from './templates/lootbox-unlocked'
import { SkinComplete } from './templates/skin-complete'
import { SkinFailed } from './templates/skin-failed'
import { TasteComplete } from './templates/taste-complete'
import { TasteFailed } from './templates/taste-failed'
import { AvatarComplete } from './templates/avatar-complete'

// ─────────────────────────────────────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────────────────────────────────────

export const sendApplicationReceived = (args: {
  to: string
  name: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: "We've got your TAG application",
    react: <ApplicationReceived name={args.name} />,
    tag: 'application-received',
  })

export const sendApplicationNewAdmin = async (args: {
  applicantName: string
  applicantEmail: string
  building: string
  whyTag: string
  referral?: string | null
}): Promise<SendEmailResult> => {
  const admins = await getAdminRecipients()
  if (admins.length === 0) return { ok: false, skipped: true }

  return sendEmail({
    to: admins,
    subject: `New TAG application: ${args.applicantName}`,
    react: (
      <ApplicationNewAdmin
        applicantName={args.applicantName}
        applicantEmail={args.applicantEmail}
        building={args.building}
        whyTag={args.whyTag}
        referral={args.referral}
      />
    ),
    tag: 'application-new-admin',
  })
}

export const sendApplicationApproved = (args: {
  to: string
  name: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: "You're in — welcome to TAG",
    react: <ApplicationApproved name={args.name} />,
    tag: 'application-approved',
  })

export const sendApplicationRejected = (args: {
  to: string
  name: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'An update on your TAG application',
    react: <ApplicationRejected name={args.name} />,
    tag: 'application-rejected',
  })

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding
// ─────────────────────────────────────────────────────────────────────────────

export const sendWelcomeAmbassador = (args: {
  to: string
  name: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Welcome to TAG',
    react: <WelcomeAmbassador name={args.name} />,
    tag: 'welcome-ambassador',
  })

// ─────────────────────────────────────────────────────────────────────────────
// Membership (Stripe)
// ─────────────────────────────────────────────────────────────────────────────

export const sendSubscriptionActive = (args: {
  to: string
  name?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: "You're now a TAG Builder",
    react: <SubscriptionActive name={args.name} />,
    tag: 'subscription-active',
  })

export const sendPaymentFailed = (args: {
  to: string
  name?: string
  amountDue?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your TAG membership payment failed',
    react: <PaymentFailed name={args.name} amountDue={args.amountDue} />,
    tag: 'payment-failed',
  })

export const sendSubscriptionCancelled = (args: {
  to: string
  name?: string
  endsOn?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your TAG Builder membership has ended',
    react: <SubscriptionCancelled name={args.name} endsOn={args.endsOn} />,
    tag: 'subscription-cancelled',
  })

// ─────────────────────────────────────────────────────────────────────────────
// Contract
// ─────────────────────────────────────────────────────────────────────────────

export const sendContractSigned = (args: {
  to: string
  representativeName: string
  companyName: string
  signedOn: string
  pdf: Buffer
  filename: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your TAG membership contract',
    react: (
      <ContractSigned
        representativeName={args.representativeName}
        companyName={args.companyName}
        signedOn={args.signedOn}
      />
    ),
    attachments: [
      {
        filename: args.filename,
        content: args.pdf,
        contentType: 'application/pdf',
      },
    ],
    tag: 'contract-signed',
  })

// ─────────────────────────────────────────────────────────────────────────────
// AI/AM claims
// ─────────────────────────────────────────────────────────────────────────────

export const sendClaimSubmitted = (args: {
  to: string
  name?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: "We've received your AI/AM claim",
    react: <ClaimSubmitted name={args.name} />,
    tag: 'claim-submitted',
  })

export const sendClaimNewAdmin = async (args: {
  userName?: string
  userEmail: string
}): Promise<SendEmailResult> => {
  const admins = await getAdminRecipients()
  if (admins.length === 0) return { ok: false, skipped: true }

  return sendEmail({
    to: admins,
    subject: `New AI/AM claim: ${args.userName ?? args.userEmail}`,
    react: <ClaimNewAdmin userName={args.userName} userEmail={args.userEmail} />,
    tag: 'claim-new-admin',
  })
}

export const sendClaimApproved = (args: {
  to: string
  name?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your AI/AM claim is approved',
    react: <ClaimApproved name={args.name} />,
    tag: 'claim-approved',
  })

export const sendClaimRejected = (args: {
  to: string
  name?: string
  notes?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'An update on your AI/AM claim',
    react: <ClaimRejected name={args.name} notes={args.notes} />,
    tag: 'claim-rejected',
  })

export const sendClaimRevoked = (args: {
  to: string
  name?: string
  notes?: string
  keptBuilderViaStripe?: boolean
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your AI/AM claim has been revoked',
    react: (
      <ClaimRevoked
        name={args.name}
        notes={args.notes}
        keptBuilderViaStripe={args.keptBuilderViaStripe}
      />
    ),
    tag: 'claim-revoked',
  })

// ─────────────────────────────────────────────────────────────────────────────
// Lootbox
// ─────────────────────────────────────────────────────────────────────────────

export const sendLootboxUnlocked = (args: {
  to: string
  name?: string
  eventTitle: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: `You unlocked a lootbox at ${args.eventTitle}`,
    react: <LootboxUnlocked name={args.name} eventTitle={args.eventTitle} />,
    tag: 'lootbox-unlocked',
  })

export const sendSkinComplete = (args: {
  to: string
  name?: string
  skinName?: string
  rarity?: string
  imageUrl?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your TAG skin is ready',
    react: (
      <SkinComplete
        name={args.name}
        skinName={args.skinName}
        rarity={args.rarity}
        imageUrl={args.imageUrl}
      />
    ),
    tag: 'skin-complete',
  })

export const sendSkinFailed = (args: {
  to: string
  name?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your TAG skin generation failed',
    react: <SkinFailed name={args.name} />,
    tag: 'skin-failed',
  })

// ─────────────────────────────────────────────────────────────────────────────
// Taste profile
// ─────────────────────────────────────────────────────────────────────────────

export const sendTasteComplete = (args: {
  to: string
  name?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your TAG Taste profile is live',
    react: <TasteComplete name={args.name} />,
    tag: 'taste-complete',
  })

export const sendTasteFailed = (args: {
  to: string
  name?: string
  errorMessage?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your Taste profile generation failed',
    react: <TasteFailed name={args.name} errorMessage={args.errorMessage} />,
    tag: 'taste-failed',
  })

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

export const sendAvatarComplete = (args: {
  to: string
  name?: string
  imageUrl?: string
}): Promise<SendEmailResult> =>
  sendEmail({
    to: args.to,
    subject: 'Your TAG avatar is ready',
    react: <AvatarComplete name={args.name} imageUrl={args.imageUrl} />,
    tag: 'avatar-complete',
  })

// Re-exported so callers that need to resolve a user's email from an id
// don't have to import from two places.
export { getUserEmail, getAdminRecipients }
