# Membership & Onboarding Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Stripe-powered membership tiers (Fan/Builder/Operator) with contract signing, payment, and subscription management so users can self-service upgrade from free Fan to paid Builder (€150/month).

**Architecture:** Stripe Checkout handles payment collection, Stripe webhooks sync subscription state to a `subscriptions` table in Supabase. A `contracts` table records signed agreements. The existing `profiles.role` column drives access control. A new `lib/membership/` feature module contains all membership logic, with UI components for the upgrade flow, contract signing, and subscription management.

**Tech Stack:** Stripe (checkout, webhooks, customer portal), Supabase (database, storage for contract PDFs), Next.js API routes, Zod validation, `@react-pdf/renderer` for contract PDF generation.

---

## File Structure

```
lib/membership/
  types.ts              — Subscription, Contract interfaces, role types
  schema.ts             — Zod schemas for contract signing, checkout
  queries.ts            — Get subscription, contract status
  mutations.ts          — Create/update subscription, sign contract
  actions.ts            — Server actions for contract signing
  contract-template.ts  — Contract text content and version
  pdf.ts                — PDF generation for contracts
  components/
    index.ts            — Barrel exports
    upgrade-card.tsx    — "Become a Builder" CTA card
    contract-dialog.tsx — Contract review and signing modal
    membership-card.tsx — Current membership display (replaces hardcoded tier in profile)
    manage-subscription.tsx — Cancel/manage subscription button

app/api/stripe/
  checkout/route.ts     — Creates Stripe Checkout session
  webhook/route.ts      — Handles Stripe webhook events
  portal/route.ts       — Creates Stripe Customer Portal session

supabase/migrations/
  20260310130000_add_membership.sql — subscriptions + contracts tables, role rename
```

---

## Chunk 1: Database & Dependencies

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Stripe SDK and PDF generator**

```bash
pnpm add stripe @react-pdf/renderer
```

- [ ] **Step 2: Verify installation**

```bash
pnpm typecheck
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add stripe and @react-pdf/renderer"
```

---

### Task 2: Database migration — subscriptions, contracts, role rename

**Files:**
- Create: `supabase/migrations/20260310130000_add_membership.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Rename roles: rookie → fan, admin → operator
UPDATE profiles SET role = 'fan' WHERE role = 'rookie';
UPDATE profiles SET role = 'operator' WHERE role = 'admin';

-- Update check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('fan', 'builder', 'operator'));

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'incomplete'
    CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Contracts table
CREATE TABLE contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  version text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on contracts"
  ON contracts FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast subscription lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_contracts_user_id ON contracts(user_id);

-- Add stripe_customer_id to profiles for quick lookup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
```

- [ ] **Step 2: Push migration to remote**

```bash
supabase db push --linked
```

Expected: Migration applies successfully.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260310130000_add_membership.sql
git commit -m "db: add subscriptions and contracts tables, rename roles to fan/builder/operator"
```

---

### Task 3: Update role types and references across codebase

**Files:**
- Modify: `lib/auth/types.ts`
- Modify: `lib/auth/queries.ts`
- Modify: `app/portal/profile/page.tsx`
- Modify: `lib/portal/components/space-tabs.tsx` (if it references roles)
- Modify: `lib/events/components/portal-event-list.tsx` (if it references roles)

- [ ] **Step 1: Update UserRole type**

In `lib/auth/types.ts`, change:
```typescript
export type UserRole = 'fan' | 'builder' | 'operator'
```

- [ ] **Step 2: Update default role in queries.ts**

In `lib/auth/queries.ts`, in `fetchProfile`, change the default:
```typescript
role: (data?.role as UserRole) ?? 'fan',
```

- [ ] **Step 3: Update profile page role config**

In `app/portal/profile/page.tsx`, update `roleConfig` to use new role names:
```typescript
const roleConfig: Record<UserRole, { label: string; icon: typeof Check; color: string }> = {
  fan: {
    label: 'Fan',
    icon: Star,
    color: 'text-tag-muted',
  },
  builder: {
    label: 'Builder',
    icon: Check,
    color: 'text-tag-orange',
  },
  operator: {
    label: 'Operator',
    icon: Shield,
    color: 'text-tag-orange',
  },
}
```

- [ ] **Step 4: Search and replace remaining role references**

Search the entire codebase for `'rookie'` and `'admin'` string literals used as role values. Replace:
- `'rookie'` → `'fan'`
- `'admin'` → `'operator'`

Check these files specifically:
- `lib/events/components/portal-event-list.tsx` — admin checks for event management
- `lib/portal/components/space-tabs.tsx` — admin checks for facilities management
- `app/api/events/route.ts` — admin auth check
- `app/api/events/[id]/route.ts`
- `app/api/facilities/route.ts`, `app/api/facilities/[id]/route.ts`
- `app/api/house-rules/route.ts`, `app/api/house-rules/[id]/route.ts`
- `app/api/opening-hours/route.ts`, `app/api/opening-hours/[id]/route.ts`
- `app/api/members/route.ts`

- [ ] **Step 5: Update handle_new_user trigger default role**

The current trigger inserts profiles without a role, so it falls back to the DB default. The DB default is `'rookie'` — we need to update it:

Create migration `supabase/migrations/20260310130100_fix_default_role.sql`:
```sql
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'fan';
```

Push: `supabase db push --linked`

- [ ] **Step 6: Typecheck**

```bash
pnpm typecheck
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: rename roles — rookie→fan, admin→operator"
```

---

## Chunk 2: Membership Feature Module

### Task 4: Types and schemas

**Files:**
- Create: `lib/membership/types.ts`
- Create: `lib/membership/schema.ts`

- [ ] **Step 1: Create types**

`lib/membership/types.ts`:
```typescript
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'unpaid'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at: string | null
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  user_id: string
  version: string
  signed_at: string
  pdf_url: string | null
  created_at: string
}

export type MembershipTier = 'fan' | 'builder'

export interface MembershipStatus {
  tier: MembershipTier
  subscription: Subscription | null
  contract: Contract | null
  canUpgrade: boolean
  canCancel: boolean
}
```

- [ ] **Step 2: Create schemas**

`lib/membership/schema.ts`:
```typescript
import { z } from 'zod'

export const signContractSchema = z.object({
  version: z.string().min(1),
})

export type SignContractInput = z.infer<typeof signContractSchema>
```

- [ ] **Step 3: Commit**

```bash
git add lib/membership/types.ts lib/membership/schema.ts
git commit -m "feat(membership): add types and schemas"
```

---

### Task 5: Queries and mutations

**Files:**
- Create: `lib/membership/queries.ts`
- Create: `lib/membership/mutations.ts`

- [ ] **Step 1: Create queries**

`lib/membership/queries.ts`:
```typescript
import { createServerSupabaseClient } from '@lib/db'

import type { Subscription, Contract, MembershipStatus } from './types'

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getSubscription error:', error.message)
    return null
  }

  return data as Subscription | null
}

export async function getLatestContract(userId: string): Promise<Contract | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', userId)
    .order('signed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getLatestContract error:', error.message)
    return null
  }

  return data as Contract | null
}

export async function getMembershipStatus(userId: string, role: string): Promise<MembershipStatus> {
  const [subscription, contract] = await Promise.all([
    getSubscription(userId),
    getLatestContract(userId),
  ])

  const isBuilder = role === 'builder' || role === 'operator'
  const hasActiveSubscription = subscription?.status === 'active'

  return {
    tier: isBuilder ? 'builder' : 'fan',
    subscription,
    contract,
    canUpgrade: !isBuilder && !hasActiveSubscription,
    canCancel: hasActiveSubscription && !subscription?.cancel_at,
  }
}
```

- [ ] **Step 2: Create mutations**

`lib/membership/mutations.ts`:
```typescript
import Stripe from 'stripe'

import { createServerSupabaseClient } from '@lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function createOrGetStripeCustomer(userId: string, email: string): Promise<string> {
  const supabase = await createServerSupabaseClient()

  // Check if user already has a Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })

  // Store customer ID on profile
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer.id
}

export async function createCheckoutSession(customerId: string, userId: string): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/portal/profile?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/portal/profile?upgrade=canceled`,
    subscription_data: {
      metadata: { supabase_user_id: userId },
    },
  })

  return session.url!
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/portal/profile`,
  })

  return session.url
}

export async function insertContract(userId: string, version: string, pdfUrl?: string) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('contracts').insert({
    user_id: userId,
    version,
    pdf_url: pdfUrl ?? null,
  })

  if (error) throw new Error(error.message)
}

export async function upsertSubscription(data: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAt: Date | null
}) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: data.userId,
        stripe_customer_id: data.stripeCustomerId,
        stripe_subscription_id: data.stripeSubscriptionId,
        status: data.status,
        current_period_start: data.currentPeriodStart.toISOString(),
        current_period_end: data.currentPeriodEnd.toISOString(),
        cancel_at: data.cancelAt?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    )

  if (error) throw new Error(error.message)
}

export async function updateProfileRole(userId: string, role: 'fan' | 'builder') {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add lib/membership/queries.ts lib/membership/mutations.ts
git commit -m "feat(membership): add queries and mutations"
```

---

### Task 6: Contract template and PDF generation

**Files:**
- Create: `lib/membership/contract-template.ts`
- Create: `lib/membership/pdf.ts`

- [ ] **Step 1: Create contract template**

`lib/membership/contract-template.ts`:
```typescript
export const CONTRACT_VERSION = '1.0'

export const contractSections = [
  {
    title: 'Membership Terms',
    content:
      'By signing this agreement, you enter into a monthly Builder membership with TAG. ' +
      'Your membership grants you a dedicated desk, 24/7 building access, meeting room usage, ' +
      'a business mail address, and full access to all TAG events and community resources.',
  },
  {
    title: 'Pricing & Billing',
    content:
      'The Builder membership is €150 per month, billed monthly via Stripe. ' +
      'Your first payment is due upon signing. Subsequent payments are charged on the same ' +
      'date each month.',
  },
  {
    title: 'Cancellation Policy',
    content:
      'You may cancel your membership at any time. If you cancel before the 15th of the month, ' +
      'your membership ends at the end of the current month. If you cancel on or after the 15th, ' +
      'you will be charged for the following month, and your membership ends at the end of that month.',
  },
  {
    title: 'House Rules',
    content:
      'You agree to follow all TAG house rules as displayed in the space and on the member portal. ' +
      'TAG reserves the right to update house rules with reasonable notice. Repeated violations ' +
      'may result in membership termination.',
  },
  {
    title: 'Liability',
    content:
      'You are responsible for your personal belongings. TAG is not liable for lost, stolen, ' +
      'or damaged personal property. You agree to use the space and its facilities responsibly.',
  },
]
```

- [ ] **Step 2: Create PDF generator**

`lib/membership/pdf.ts`:
```typescript
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

import { contractSections, CONTRACT_VERSION } from './contract-template'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subheader: { fontSize: 10, color: '#666', marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 6 },
  sectionContent: { lineHeight: 1.6, color: '#333' },
  signature: { marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#ddd' },
  signatureLabel: { fontSize: 10, color: '#666', marginBottom: 4 },
  signatureValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
})

export async function generateContractPdf(memberName: string, memberEmail: string, signedAt: Date): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>TAG Builder Membership Agreement</Text>
        <Text style={styles.subheader}>Version {CONTRACT_VERSION}</Text>

        {contractSections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.signature}>
          <Text style={styles.signatureLabel}>Signed by</Text>
          <Text style={styles.signatureValue}>{memberName || memberEmail}</Text>
          <Text style={styles.signatureLabel}>Email: {memberEmail}</Text>
          <Text style={styles.signatureLabel}>
            Date: {signedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </Page>
    </Document>
  )

  return await renderToBuffer(doc)
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/membership/contract-template.ts lib/membership/pdf.ts
git commit -m "feat(membership): add contract template and PDF generation"
```

---

### Task 7: Contract signing server action

**Files:**
- Create: `lib/membership/actions.ts`

- [ ] **Step 1: Create server action**

`lib/membership/actions.ts`:
```typescript
'use server'

import { createServerSupabaseClient } from '@lib/db'

import { insertContract } from './mutations'
import { generateContractPdf } from './pdf'
import { CONTRACT_VERSION } from './contract-template'

export async function signContract(): Promise<{ status: 'success' | 'failed' }> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { status: 'failed' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const signedAt = new Date()

    // Generate PDF
    const pdfBuffer = await generateContractPdf(
      profile?.name ?? '',
      user.email ?? '',
      signedAt
    )

    // Upload to Supabase Storage
    const path = `contracts/${user.id}/${CONTRACT_VERSION}-${signedAt.getTime()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(path, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Contract upload error:', uploadError.message)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('contracts').getPublicUrl(path)

    // Store contract record
    await insertContract(user.id, CONTRACT_VERSION, uploadError ? undefined : publicUrl)

    return { status: 'success' }
  } catch (error) {
    console.error('signContract error:', error)
    return { status: 'failed' }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/membership/actions.ts
git commit -m "feat(membership): add contract signing server action"
```

---

## Chunk 3: Stripe API Routes

### Task 8: Checkout route

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Create checkout route**

`app/api/stripe/checkout/route.ts`:
```typescript
import { NextResponse } from 'next/server'

import { getUser } from '@lib/auth/queries'
import { getLatestContract } from '@lib/membership/queries'
import { createOrGetStripeCustomer, createCheckoutSession } from '@lib/membership/mutations'
import { CONTRACT_VERSION } from '@lib/membership/contract-template'

export async function POST() {
  try {
    const user = await getUser()

    // Verify contract is signed
    const contract = await getLatestContract(user.id)
    if (!contract || contract.version !== CONTRACT_VERSION) {
      return NextResponse.json(
        { errors: [{ message: 'Contract must be signed before checkout' }] },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const customerId = await createOrGetStripeCustomer(user.id, user.email)

    // Create checkout session
    const url = await createCheckoutSession(customerId, user.id)

    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[stripe/checkout POST] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/stripe/checkout/route.ts
git commit -m "feat(stripe): add checkout session API route"
```

---

### Task 9: Webhook route

**Files:**
- Create: `app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Create webhook route**

`app/api/stripe/webhook/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { upsertSubscription, updateProfileRole } from '@lib/membership/mutations'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          await handleSubscriptionChange(subscription)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await handleSubscriptionChange(subscription)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id
  if (!userId) {
    console.error('No supabase_user_id in subscription metadata')
    return
  }

  const status = subscription.status
  const cancelAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000)
    : null

  await upsertSubscription({
    userId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAt,
  })

  // Update profile role based on subscription status
  if (status === 'active') {
    await updateProfileRole(userId, 'builder')
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateProfileRole(userId, 'fan')
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat(stripe): add webhook handler for subscription events"
```

---

### Task 10: Billing portal route

**Files:**
- Create: `app/api/stripe/portal/route.ts`

- [ ] **Step 1: Create portal route**

`app/api/stripe/portal/route.ts`:
```typescript
import { NextResponse } from 'next/server'

import { getUser } from '@lib/auth/queries'
import { getSubscription } from '@lib/membership/queries'
import { createBillingPortalSession } from '@lib/membership/mutations'

export async function POST() {
  try {
    const user = await getUser()

    const subscription = await getSubscription(user.id)
    if (!subscription) {
      return NextResponse.json(
        { errors: [{ message: 'No active subscription found' }] },
        { status: 400 }
      )
    }

    const url = await createBillingPortalSession(subscription.stripe_customer_id)

    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[stripe/portal POST] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/stripe/portal/route.ts
git commit -m "feat(stripe): add billing portal API route"
```

---

## Chunk 4: UI Components

### Task 11: Membership components

**Files:**
- Create: `lib/membership/components/index.ts`
- Create: `lib/membership/components/upgrade-card.tsx`
- Create: `lib/membership/components/contract-dialog.tsx`
- Create: `lib/membership/components/membership-card.tsx`
- Create: `lib/membership/components/manage-subscription.tsx`

- [ ] **Step 1: Create upgrade card**

`lib/membership/components/upgrade-card.tsx`:
```typescript
'use client'

import { Rocket } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@components/ui/button'

import { ContractDialog } from './contract-dialog'

export const UpgradeCard = () => {
  const [showContract, setShowContract] = useState(false)

  return (
    <>
      <div className="rounded-lg border-2 border-dashed border-tag-orange/30 bg-tag-orange/5 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-tag-orange/10 p-2">
            <Rocket className="h-5 w-5 text-tag-orange" />
          </div>
          <div className="flex-1">
            <h3 className="font-syne text-lg font-bold text-tag-text">
              Become a Builder
            </h3>
            <p className="mt-1 text-sm text-tag-muted">
              Get a dedicated desk, 24/7 access, meeting rooms, and more for €150/month.
            </p>
            <Button
              onClick={() => setShowContract(true)}
              className="mt-4 bg-tag-orange text-white hover:bg-tag-orange/90"
            >
              Upgrade to Builder
            </Button>
          </div>
        </div>
      </div>

      <ContractDialog open={showContract} onOpenChange={setShowContract} />
    </>
  )
}
```

- [ ] **Step 2: Create contract dialog**

`lib/membership/components/contract-dialog.tsx`:
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog'

import { signContract } from '../actions'
import { contractSections, CONTRACT_VERSION } from '../contract-template'

interface ContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ContractDialog = ({ open, onOpenChange }: ContractDialogProps) => {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [signing, setSigning] = useState(false)

  const handleSign = async () => {
    setSigning(true)

    const result = await signContract()

    if (result.status === 'success') {
      // Proceed to Stripe Checkout
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ type: 'error', description: 'Failed to start checkout.' })
        setSigning(false)
      }
    } else {
      toast({ type: 'error', description: 'Failed to sign contract.' })
      setSigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl text-tag-text">
            Builder Membership Agreement
          </DialogTitle>
          <p className="text-xs text-tag-dim">Version {CONTRACT_VERSION}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {contractSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-tag-text">{section.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-tag-muted">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-tag-border pt-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-tag-border accent-tag-orange"
            />
            <span className="text-sm text-tag-muted">
              I have read and agree to the TAG Builder Membership Agreement.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-tag-border text-tag-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!accepted || signing}
            className="bg-tag-orange text-white hover:bg-tag-orange/90 disabled:opacity-50"
          >
            {signing ? 'Processing...' : 'Sign & Continue to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Create membership card**

`lib/membership/components/membership-card.tsx`:
```typescript
import { Check, Star } from 'lucide-react'

import type { MembershipStatus } from '../types'

interface MembershipCardProps {
  status: MembershipStatus
  userName: string | null
}

export const MembershipCard = ({ status, userName }: MembershipCardProps) => {
  const isBuilder = status.tier === 'builder'

  return (
    <div
      className={`rounded-lg border p-6 ${
        isBuilder ? 'border-tag-orange bg-tag-orange/5' : 'border-tag-border bg-tag-card'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-full p-2 ${
            isBuilder ? 'bg-tag-orange/10 text-tag-orange' : 'bg-tag-card text-tag-muted'
          }`}
        >
          {isBuilder ? <Check className="h-5 w-5" /> : <Star className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-syne text-lg font-bold text-tag-text">
            {isBuilder ? 'Builder' : 'Fan'}
          </h3>
          <p className="text-sm text-tag-muted">
            {isBuilder ? '€150/month — dedicated desk, 24/7 access' : 'Free — community access & events'}
          </p>
        </div>
      </div>

      {status.subscription && (
        <div className="mt-4 space-y-1 border-t border-tag-border pt-4 text-sm text-tag-muted">
          {status.subscription.current_period_end && (
            <p>
              Next billing:{' '}
              {new Date(status.subscription.current_period_end).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          {status.subscription.cancel_at && (
            <p className="text-tag-orange">
              Cancels on:{' '}
              {new Date(status.subscription.cancel_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create manage subscription button**

`lib/membership/components/manage-subscription.tsx`:
```typescript
'use client'

import { useState } from 'react'

import { toast } from '@components/toast'
import { Button } from '@components/ui/button'

export const ManageSubscription = () => {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ type: 'error', description: 'Failed to open billing portal.' })
      }
    } catch {
      toast({ type: 'error', description: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleManage}
      disabled={loading}
      className="border-tag-border text-tag-muted hover:text-tag-text"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  )
}
```

- [ ] **Step 5: Create barrel export**

`lib/membership/components/index.ts`:
```typescript
export { UpgradeCard } from './upgrade-card'
export { ContractDialog } from './contract-dialog'
export { MembershipCard } from './membership-card'
export { ManageSubscription } from './manage-subscription'
```

- [ ] **Step 6: Commit**

```bash
git add lib/membership/components/
git commit -m "feat(membership): add UI components — upgrade card, contract dialog, membership card, manage subscription"
```

---

## Chunk 5: Integration & Profile Page

### Task 12: Update profile page to use membership components

**Files:**
- Modify: `app/portal/profile/page.tsx`

- [ ] **Step 1: Update profile page**

Replace the hardcoded membership tier section in `app/portal/profile/page.tsx` with the new membership components. Import and use:

```typescript
import { getMembershipStatus } from '@lib/membership/queries'
import { MembershipCard, UpgradeCard, ManageSubscription } from '@lib/membership/components'
```

In the component body, after fetching `user`:
```typescript
const membershipStatus = await getMembershipStatus(user.id, user.role)
```

Replace the existing tier display with:
```tsx
<MembershipCard status={membershipStatus} userName={user.name} />

{membershipStatus.canUpgrade && <UpgradeCard />}

{membershipStatus.subscription?.status === 'active' && <ManageSubscription />}
```

Remove the old `pricingTiers` import and hardcoded tier section.

- [ ] **Step 2: Typecheck and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/portal/profile/page.tsx
git commit -m "feat(membership): integrate membership components into profile page"
```

---

### Task 13: Add environment variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

- [ ] **Step 1: Update .env.example**

Add to `.env.example`:
```
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
```

- [ ] **Step 2: Update .env.local with real values**

User needs to:
1. Create a Stripe account (or use existing)
2. Create a Product "Builder Membership" with a €150/month recurring Price
3. Copy the keys from Stripe Dashboard → Developers → API Keys
4. Set up webhook endpoint in Stripe Dashboard pointing to `https://yourdomain.com/api/stripe/webhook`
5. Copy the webhook signing secret

- [ ] **Step 3: Commit .env.example only**

```bash
git add .env.example
git commit -m "chore: add Stripe env vars to .env.example"
```

---

### Task 14: Create Supabase storage bucket for contracts

- [ ] **Step 1: Create the contracts storage bucket**

Go to Supabase Dashboard → Storage → Create bucket named `contracts`. Set it to private (not public). Add a policy to allow authenticated users to read their own contracts.

Alternatively, create a migration for it:

`supabase/migrations/20260310130200_create_contracts_bucket.sql`:
```sql
-- Create contracts storage bucket (run via Supabase Dashboard if this doesn't work via migration)
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read their own contracts
CREATE POLICY "Users can read own contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow service role to upload contracts
CREATE POLICY "Service role can upload contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts'
    AND auth.role() = 'service_role'
  );
```

- [ ] **Step 2: Push migration**

```bash
supabase db push --linked
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260310130200_create_contracts_bucket.sql
git commit -m "db: add contracts storage bucket and policies"
```

---

## Chunk 6: Testing

### Task 15: Route tests for Stripe API

**Files:**
- Create: `tests/routes/stripe-checkout.test.ts`
- Create: `tests/routes/stripe-portal.test.ts`

- [ ] **Step 1: Write checkout route test**

`tests/routes/stripe-checkout.test.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('POST /api/stripe/checkout', () => {
  test('returns 401 when not authenticated', async ({ request }) => {
    const response = await request.post('/api/stripe/checkout')
    // Should redirect to login or return error
    expect(response.status()).not.toBe(200)
  })
})
```

- [ ] **Step 2: Write portal route test**

`tests/routes/stripe-portal.test.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('POST /api/stripe/portal', () => {
  test('returns error when not authenticated', async ({ request }) => {
    const response = await request.post('/api/stripe/portal')
    expect(response.status()).not.toBe(200)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
pnpm test:routes
```

- [ ] **Step 4: Commit**

```bash
git add tests/routes/stripe-checkout.test.ts tests/routes/stripe-portal.test.ts
git commit -m "test: add route tests for stripe checkout and portal endpoints"
```

---

### Task 16: Final verification

- [ ] **Step 1: Full typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

- [ ] **Step 3: Build**

```bash
pnpm build
```

- [ ] **Step 4: Run all tests**

```bash
pnpm test
```

- [ ] **Step 5: Fix any issues and commit**

If errors are found, fix them and commit with descriptive message.
