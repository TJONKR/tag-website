# Membership & Onboarding Design

## Tiers

| Tier | Price | Access | Assignment |
|------|-------|--------|------------|
| Fan | Free | Community, events, portal, WiFi when visiting | Default on registration |
| Builder | €150/month | Everything in Fan + dedicated desk, 24/7 access, meeting rooms, mail address | Self-service upgrade via Stripe |
| Operator | — | Everything in Builder + manage events, facilities, members, contracts | Assigned by staff |

## User Journey

1. **Register** — email + password, becomes a Fan
2. **Fan** — free portal access, can attend events
3. **Upgrade** — clicks "Become a Builder" in portal
4. **Contract** — reviews and accepts membership agreement (terms, pricing, cancellation policy, house rules)
5. **Pay** — Stripe Checkout, €150/month recurring
6. **Builder** — dedicated desk, 24/7, the works

## Contract

- Clickwrap agreement shown in-app before payment
- User reads terms, checks acceptance box, signs
- PDF automatically generated and sent to member + TAG
- Covers: membership terms, pricing, cancellation policy, house rules acknowledgment
- Contract stored in DB with signed_at timestamp and version

## Cancellation Rules

- Month-to-month, no minimum commitment
- **Cancel before the 15th** — membership ends at end of current month
- **Cancel after the 15th** — locked in for the next month, ends at end of next month
- On cancellation: role reverts to Fan, desk access revoked

## Technical Architecture

### Stripe Setup

- One Product: "Builder Membership"
- One Price: €150/month recurring
- Stripe Checkout for payment collection
- Stripe Customer Portal for subscription management (cancel, update payment method)
- Webhooks to sync subscription status to Supabase

### Database Changes

**Rename roles in `profiles`:**
- `rookie` → `fan`
- `admin` → `operator`
- `builder` stays

**New table: `subscriptions`**
- id (uuid, PK)
- user_id (FK → profiles)
- stripe_customer_id (text)
- stripe_subscription_id (text)
- status (text: active, canceled, past_due, incomplete)
- current_period_start (timestamptz)
- current_period_end (timestamptz)
- cancel_at (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

**New table: `contracts`**
- id (uuid, PK)
- user_id (FK → profiles)
- version (text — contract version identifier)
- signed_at (timestamptz)
- pdf_url (text — Supabase Storage path)
- created_at (timestamptz)

### New API Routes

- `POST /api/stripe/checkout` — creates Stripe Checkout session (requires signed contract)
- `POST /api/stripe/webhook` — handles Stripe events (subscription created/updated/deleted)
- `POST /api/stripe/portal` — creates Stripe Customer Portal session
- `POST /api/contracts/sign` — records acceptance, generates PDF, stores in Supabase Storage

### Webhook Events to Handle

- `checkout.session.completed` — link Stripe customer to user, create subscription record
- `customer.subscription.updated` — sync status, period dates, cancellation
- `customer.subscription.deleted` — set role back to fan
- `invoice.payment_failed` — mark subscription as past_due

### Upgrade Flow (detailed)

1. Fan clicks "Become a Builder" in portal profile/membership page
2. App shows contract terms in a modal/page
3. User checks "I accept" and clicks sign → `POST /api/contracts/sign`
4. Backend stores contract record, generates PDF, emails copy
5. Frontend redirects to `POST /api/stripe/checkout` → Stripe Checkout
6. User completes payment on Stripe
7. Stripe sends `checkout.session.completed` webhook
8. Webhook handler creates subscription record, updates `profiles.role` to `builder`
9. User redirected back to portal with Builder access

### Cancellation Flow

1. Builder clicks "Manage Subscription" → redirected to Stripe Customer Portal
2. Or: Builder clicks "Cancel" in portal → `POST /api/stripe/portal`
3. Stripe portal handles cancellation
4. Custom cancellation logic: if before 15th, cancel_at = end of month; if after 15th, cancel_at = end of next month
5. Webhook `customer.subscription.updated` updates cancel_at in DB
6. When subscription actually ends: webhook sets role back to fan

### New Dependencies

- `stripe` — Stripe Node.js SDK
- `@react-pdf/renderer` or `jspdf` — PDF generation for contracts

### Environment Variables

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY` (NEXT_PUBLIC_)
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID` — the €150/month price ID
