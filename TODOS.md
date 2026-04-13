# TODOs

Captured from full codebase engineering audit (2026-03-16).

---

## Architecture

### TODO-6: Luma sync loads all auth users into memory
**What:** `lib/luma/sync.ts` and `lib/luma/mutations.ts` paginate through ALL Supabase auth users (1000/page) to build an email→userId map for guest matching.
**Why:** O(n) memory + queries. Works under ~1000 users, breaks at scale.
**Fix:** Replace with per-email lookup via `supabase.auth.admin.getUserByEmail()` or a profiles-table email index query.
**When:** When user count approaches 1000+.
**Effort:** Small.

### TODO-8: Standardize error response format across API routes
**What:** Three inconsistent formats: `{ errors: [{ message }] }` (most routes), `{ error: 'string' }` (stripe, fal, luma, lootbox), `{ message: 'string' }` (occasional).
**Why:** Client-side error handling has to guess which shape it gets.
**Fix:** Pick one format (recommend `{ errors: [{ message }] }` since most routes already use it), update the rest. The shared `errorResponse()` helper in `lib/api/utils.ts` (added by security hardening) can be extended for this.
**When:** Next time you're doing a broad route cleanup.
**Effort:** Small-medium (touch ~15 routes). Partially addressed by security hardening (error sanitization in 8 routes).

### TODO-10: Extract shared registration schema
**What:** `lib/auth/schema.ts` (registerSchema), `lib/onboarding/schema.ts` (onboardingSchema), and `lib/join/schema.ts` (joinSchema) all validate nearly identical fields: name, email, building, whyTag, referral, social URLs.
**Why:** If you change validation rules (e.g., max length on whyTag), you have to remember 3 places.
**Fix:** Create a shared base schema in `lib/auth/schema.ts`, compose the three variants from it.
**When:** Next time you touch any of these schemas.
**Effort:** Small.

### TODO-25: Payment & contract overhaul (AI/AM claim + onderhuur-contract) — IMPLEMENTED 2026-04-13, awaiting deploy
**What:** Refactor membership payment flow to support two paths:
1. **New members via site:** TAG onderhuur-contract (NL/EN, user kiest) → Stripe
2. **Existing AI AM members:** "I pay through AI/AM" claim button → super admin approves → Builder (no Stripe, no new contract)
**Why:** TAG positioneert zich als onderverhuurder tussen AI AM B.V. (hoofdverhuurder) en members. Real Dutch huurovereenkomst-PDF moet gegenereerd worden i.p.v. huidige generieke Engelse template.
**Scope:**
- New `super_admin` role (Tijs + Pieter only) for AI/AM approval queue
- Contract template rewrite: TAG als onderverhuurder, 1 flex desk, €150/maand excl. BTW, afgeleid van Notso-contract
- Contract velden per member: bedrijfsnaam + KVK, vestigingsplaats, vertegenwoordiger. NL + EN versies.
- Data model: `subscriptions.stripe_subscription_id` nullable, add `payment_method` (stripe|ai_am), approval audit columns (approved_by, approved_at). Contracts table: company_name, kvk, city, representative_name, language.
- Stripe blijft LIVE; add `allow_promotion_codes: true` voor live testing met coupon
- Geen recurring check voor AI/AM — eenmalig approven, super admin kan handmatig stopzetten
**Briefing:** `weekly/payment-contract-briefing.md` (volledige context, beslissingen, open items, interview-quotes)
**Blockers:**
- Juridische tekst TAG onderhuur-contract (NL + EN) moet opgesteld worden, mogelijk juridisch reviewen
- Stripe tax config verifiëren (excl BTW correct ingericht?)
**Effort:** Large (migratie + UI + API + tests, twee flows).

### TODO-11: Standardize mutation error handling patterns
**What:** Some mutations throw errors, some return `{ status: 'success' | 'failed' }`, some use Zod safeParse. Callers can't predict whether to try/catch or check return values.
**Why:** Inconsistency creates confusion and potential missed errors.
**Fix:** Standardize to throw pattern for mutations — works naturally with try/catch in API routes.
**When:** Incremental — fix as you touch each module.
**Effort:** Medium (spread across many files).

---

## Code Quality

### TODO-9: Split space-tabs.tsx (839 lines)
**What:** `lib/portal/components/space-tabs.tsx` contains 5 tab panels (floor plan, facilities, hours, guidelines, contact), inline CRUD dialogs, drag-and-drop, and API helper functions.
**Why:** Hard to navigate, test, or modify one tab without reading 800+ lines. Inline `apiSubmit()`/`apiDelete()` helpers belong in mutations.
**Fix:** Split into `facilities-tab.tsx`, `hours-tab.tsx`, `guidelines-tab.tsx`, etc. Move API helpers to `lib/portal/mutations.ts`. Each tab is independent — no shared state.
**When:** Next time you modify the space management UI.
**Effort:** Medium (pure refactor, no behavior change).

### TODO-12: Type `any` in taste research agent
**What:** `lib/taste/pipeline/research-agent.ts` uses `any` for Claude API tool_use response inputs (~lines 299, 318).
**Why:** Reduces type safety in the most complex module (434 lines).
**Fix:** Define interfaces for each tool's input shape based on the Claude API tool_use spec.
**When:** Next time you modify the research agent.
**Effort:** Small.

### TODO-13: Extract profile page data preparation
**What:** `app/portal/profile/page.tsx` (312 lines) runs 9 parallel queries and does significant data processing (lootbox steps, photo URL signing, date formatting, participation rates).
**Why:** Violates "thin pages" principle. Hard to test data logic in isolation.
**Fix:** Create `lib/profile/queries.ts` with `getProfilePageData()` that returns a single typed object. Page becomes `const data = await getProfilePageData(user.id)`.
**When:** Next time you add features to the profile page.
**Effort:** Small-medium.

### TODO-15: Remove unused `classnames` package
**What:** `package.json` has `classnames`, `clsx`, and `tailwind-merge` installed. The codebase uses `cn()` which combines `clsx` + `tailwind-merge`. `classnames` is likely dead.
**Fix:** Search for `classnames` imports. If none, `pnpm remove classnames`.
**Effort:** Tiny.

### TODO-16: Remove dead ChatSDKError scaffolding
**What:** `lib/errors.ts` defines a `ChatSDKError` class with chat-specific error types (`message_limit`, `chat_not_found`, etc.) from the starter template. Also `package.json` name is still `"base-starter-project"`.
**Fix:** Check if `ChatSDKError` is imported anywhere. If not, remove or replace with TAG-specific error classes. Rename package to `"tag-website"`.
**Effort:** Tiny.

---

## Performance

### TODO-20: Member counts via SQL instead of JS post-processing
**What:** `lib/people/queries.ts` `getMemberCounts()` fetches all members via RPC, then loops in JavaScript to count by role.
**Why:** O(n) post-processing. Should be `GROUP BY role` in SQL or a dedicated count query.
**Fix:** Add a `get_member_counts` RPC function or use `.select('role', { count: 'exact' })` with group.
**When:** When member count gets large or you touch the people module.
**Effort:** Small.

### TODO-22: Taste pipeline timeout graceful degradation
**What:** The taste evaluation pipeline (`runProfilePipeline`) can run up to 15 Claude iterations + formatting + skin generation. On Vercel, `maxDuration` is 300s. If the function times out mid-pipeline, the profile gets stuck in a non-terminal status (e.g., `researching`).
**Why:** User sees a stuck progress indicator. Retry button works but user doesn't know why it failed.
**Fix:** Track start time in the pipeline. If approaching 280s, save partial results and set status to `complete` (without skin) or `error` with a clear message. Alternatively, break the pipeline into smaller Vercel functions chained via queue/webhook.
**When:** When users report stuck profiles, or proactively before scaling.
**Effort:** Medium.

---

## Security

### TODO-23: Add rate limiting to public endpoints
**What:** Implement rate limiting on `/api/join` (unauthenticated POST) and auth endpoints to prevent spam and brute force.
**Why:** Currently no protection against automated form submissions or password guessing. `/api/join` is fully public.
**Pros:** Prevents abuse, protects against credential stuffing.
**Cons:** Requires infrastructure (Redis/Upstash), adds complexity, needs tuning.
**Fix:** Use Upstash `@upstash/ratelimit` or Vercel's built-in rate limiting. Apply to `/api/join`, login, and registration endpoints.
**Context:** Redis is already in `package.json` but unused. Upstash is the standard edge-compatible rate limiter for Vercel/Next.js.
**Depends on:** Choosing a rate limiting provider (Upstash recommended).
**Effort:** Medium.

### TODO-24: Add dependency audit to CI pipeline
**What:** Add `pnpm audit` to CI/CD pipeline (GitHub Actions) to catch vulnerable dependencies before deploy.
**Why:** Currently no automated vulnerability scanning. 50+ npm dependencies update frequently.
**Pros:** Catches known CVEs before they reach production.
**Cons:** Can produce false positives, may block deploys for low-severity issues.
**Fix:** Add a `pnpm audit --audit-level=high` step to GitHub Actions workflow.
**Context:** Redis is installed but unused (potential attack surface). No existing CI pipeline config found in the repo.
**Depends on:** Having a CI pipeline configured.
**Effort:** Small.

---

## Pre-existing Test Issues

### TODO-P1: Fix stale portal-auth tests
**What:** `tests/routes/portal-auth.test.ts` has 2 failing tests:
- Expects `/register` to return 404 (it returns 200 — page still exists)
- Expects no "Sign up" link on login page (link exists, points to `/join`)
**Why:** Tests were written when registration was removed, but the page wasn't deleted and the link was changed to point to `/join` instead.
**Fix:** Update or remove the stale assertions. Either delete the register-404 test, or redirect `/register` → `/join`.
**Effort:** Tiny.
