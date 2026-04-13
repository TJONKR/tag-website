# Payment & Contract Overhaul — Implementation Plan

Companion to `weekly/payment-contract-briefing.md`. Concrete fase-per-fase plan
met file paths, data model, en tests.

---

## Phase 0 — Voorbereidingen (handmatig, niet code)

1. **Stripe dashboard:** maak coupon `LIVE-TEST-100` (100% off, recurring) — voor live testing
2. **Stripe dashboard:** verifieer tax behavior op Builder price → moet `exclusive` zijn (VAT 21% NL automatisch erbij). Pas aan indien nodig.
3. **Juridische tekst:** schrijf NL + EN concept van TAG onderhuur-contract (afgeleid van Notso). Mogelijk juridisch reviewen voor we deployen.

---

## Phase 1 — Data model (Supabase migration)

**File:** `supabase/migrations/20260413120000_payment_contract_overhaul.sql`

```sql
-- New super_admin role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Promote Tijs + Pieter (run separately after enum commit, OR inline if safe)
-- UPDATE profiles SET role = 'super_admin' WHERE email IN ('tijs@...', 'pieter@...');
-- (we doen dit via een aparte seed/script omdat enum-add en gebruik in zelfde tx kan failen)

-- Extend contracts table with contract field data
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS kvk text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS representative_name text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS language text
  CHECK (language IN ('nl', 'en'));

-- New ai_am_claims table (separate from Stripe subscriptions)
CREATE TABLE ai_am_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  notes text,
  UNIQUE (user_id, status) -- prevent duplicate pending claims
);

ALTER TABLE ai_am_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own claims"
  ON ai_am_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admin full access"
  ON ai_am_claims FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Service role full access on claims"
  ON ai_am_claims FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_ai_am_claims_user_id ON ai_am_claims(user_id);
CREATE INDEX idx_ai_am_claims_status ON ai_am_claims(status);
```

**Separate seed step** (after migration commit):
```sql
-- Run via SQL editor or seed script
UPDATE profiles SET role = 'super_admin'
WHERE email IN ('<tijs-email>', '<pieter-email>');
```

**Note:** subscriptions table blijft Stripe-only — geen AI/AM rommel daarin.
Profile.role = `builder` blijft de single source of truth voor permissions,
gezet door óf Stripe webhook óf super admin approval.

---

## Phase 2 — Contract template rewrite

**Files:**
- `lib/membership/contract-template.ts` — vervangen door gestructureerde data (NL + EN)
- `lib/membership/pdf.ts` — accept contract field data, render in gekozen taal

**Structure:**
```typescript
export const CONTRACT_VERSION = '2.0'

export interface ContractFieldData {
  companyName: string
  kvk: string
  city: string
  representativeName: string
  language: 'nl' | 'en'
}

export const contractTemplates = {
  nl: {
    title: 'Onderhuurovereenkomst Flexibele Werkplek',
    sections: [ /* 11 secties uit Notso, aangepast voor TAG als onderverhuurder */ ]
  },
  en: {
    title: 'Sub-lease Agreement Flexible Workspace',
    sections: [ /* English equivalent */ ]
  }
}
```

**Key changes vs Notso:**
- Verhuurder = TAG, met clausule: TAG huurt zelf van AI AM B.V. (onderverhuur)
- Variabele velden ingevuld via `{{companyName}}` style placeholders
- 1 flex desk vast (€150/maand excl BTW)
- Clausule "beëindiging bij actie hoofdverhuurder" overnemen (3.6 uit Notso)
- Adres: Jacob Bontiusplaats 9-23 vast

---

## Phase 3 — Backend: queries, mutations, actions

**Files te updaten/maken:**

### `lib/membership/types.ts`
```typescript
export interface AiAmClaim {
  id: string
  userId: string
  status: 'pending' | 'approved' | 'rejected' | 'revoked'
  submittedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  notes: string | null
}

export interface ContractFieldData { /* see Phase 2 */ }
```

### `lib/membership/schema.ts` (new)
```typescript
export const contractFieldsSchema = z.object({
  companyName: z.string().min(1).max(200),
  kvk: z.string().regex(/^\d{8}$/, 'KVK must be 8 digits'),
  city: z.string().min(1).max(100),
  representativeName: z.string().min(1).max(150),
  language: z.enum(['nl', 'en']),
})
```

### `lib/membership/queries.ts` (new)
- `getPendingAiAmClaims()` — super admin only, returns list with user info joined
- `getUserAiAmClaim(userId)` — returns active claim if any
- `getUserContract(userId)` — latest signed contract

### `lib/membership/mutations.ts` (extend)
- `insertContract(...)` updated to accept contract field data
- `createAiAmClaim(userId)` — creates pending claim, errors if duplicate pending
- `approveAiAmClaim(claimId, reviewerId)` — sets approved + promotes role
- `rejectAiAmClaim(claimId, reviewerId, notes?)` — sets rejected
- `revokeAiAmClaim(claimId, reviewerId, notes?)` — sets revoked + demotes role

### `lib/membership/actions.ts` (extend)
- `signContract(fields)` — accepts ContractFieldData, validates, generates PDF, stores
- `submitAiAmClaim()` — server action voor user

### `lib/auth/utils.ts` (or wherever role-checks live)
- Add `isSuperAdmin(profile)` helper

---

## Phase 4 — API routes

**New / updated files:**

- `app/api/membership/claim-ai-am/route.ts` (POST) — auth required, calls submitAiAmClaim
- `app/api/admin/claims/route.ts` (GET) — super admin only, list pending
- `app/api/admin/claims/[id]/approve/route.ts` (POST) — super admin
- `app/api/admin/claims/[id]/reject/route.ts` (POST) — super admin
- `app/api/admin/claims/[id]/revoke/route.ts` (POST) — super admin
- `app/api/stripe/checkout/route.ts` (update) — accept `{ allow_promotion_codes: true }` in session config

**All admin routes:** check `profile.role === 'super_admin'`, return 403 otherwise.

---

## Phase 5 — UI

### Member-side

**`lib/membership/components/upgrade-card.tsx`** — twee knoppen:
```
[ Become a Builder via TAG → ]   [ I already pay through AI/AM → ]
```

**`lib/membership/components/contract-dialog.tsx`** — uitgebreid:
- Step 1: Form (bedrijfsnaam, KVK, plaats, vertegenwoordiger, taal-toggle NL/EN)
- Step 2: Contract preview (rendered template met ingevulde velden)
- Step 3: Checkbox "I agree" → "Sign & Continue to Payment"
- Op submit: `signContract(fields)` → Stripe checkout met `allow_promotion_codes`

**`lib/membership/components/ai-am-claim-button.tsx`** (new):
- Knop "I pay through AI/AM"
- Klik opent confirm dialog: "We'll verify with AI AM and you'll be a Builder shortly."
- Submit → POST claim → toon pending state

**`lib/membership/components/claim-pending.tsx`** (new):
- Toont "Your AI/AM claim is pending review by our team."

### Admin-side

**`app/portal/admin/claims/page.tsx`** (new):
- Server page, super admin only (redirect anders)
- Toont pending claims met user info
- Approve / Reject buttons inline
- Tabblad voor approved (om te kunnen revoken)

**`lib/membership/components/claim-row.tsx`** (new):
- Per claim: user naam + email + submitted_at + actions

---

## Phase 6 — Stripe checkout update

**`lib/membership/mutations.ts`** → `createCheckoutSession`:
```typescript
const session = await getStripe().checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',
  line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
  allow_promotion_codes: true,  // ← nieuw
  // ...rest
})
```

Verifieer ook in Stripe dashboard: price moet `tax_behavior: 'exclusive'`
hebben en automatic tax aan staan (NL VAT 21%).

---

## Phase 7 — Tests

Per CLAUDE.md: tests verplicht. Plan:

### E2E (`tests/e2e/`)
- `membership-stripe-flow.test.ts` — user vult contract velden in, ziet preview, tekent, redirect naar Stripe checkout. Verify contract row geschreven met velden + PDF in storage.
- `membership-ai-am-claim.test.ts` — user clickt AI/AM, claim wordt pending, profile blijft ambassador.
- `membership-language-toggle.test.ts` — user kiest NL → PDF generated met Dutch text.
- `admin-claims-approval.test.ts` — super admin ziet pending claim, approvet, user wordt Builder. Non-super-admin (operator) ziet 403.
- `admin-claims-revoke.test.ts` — super admin revoket approved claim, user terug naar ambassador.

### Routes (`tests/routes/`)
- `claim-ai-am.test.ts` — POST creates claim. Duplicate pending → 409. Unauth → 401.
- `admin-claims.test.ts` — GET requires super_admin. Non-super-admin → 403.
- `admin-claims-approve.test.ts` — POST flips status + role. Idempotent on already-approved.

### Manual (live)
- Use Stripe coupon `LIVE-TEST-100` voor end-to-end live test
- Verify webhook nog steeds werkt (bestaande webhook test mag niet breken)

---

## Phase 8 — Cleanup & docs

- Update profile page "Become a Builder" copy waar nodig
- `TODOS.md`: TODO-25 sluiten
- `CHANGELOG` of release note schrijven

---

## Suggested PR breakdown

Twee opties:

**Option A — één grote PR** (simpeler review, alles atomic deployed)
- All phases in één feature branch

**Option B — drie sequentiële PRs** (kleinere reviews)
1. PR #1: Phase 1 + 2 + 3 (data model + contract template + backend) — geen UI changes, niets gebroken
2. PR #2: Phase 4 + 5 + 6 (API + UI + Stripe update) — feature gaat live
3. PR #3: Phase 7 (tests, may be combined met #2)

**Aanbeveling:** Option B als juridische tekst nog niet klaar is — dan kunnen Phase 1+3 alvast landen met placeholder template. Anders Option A.

---

## Open beslissingen voor we starten

1. **Email/notification** bij claim submission (super admins) en bij approval (user)? Briefing zegt "open item". Default: alleen in-app, geen email — dat is later toe te voegen.
2. **PR strategie:** A of B?
3. **Juridische tekst:** klaar / wordt nog geschreven / placeholder voor nu en later replacen?
4. **Super admin emails:** wat zijn de exacte emails van Tijs + Pieter in Supabase auth?
