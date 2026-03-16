# Failure Modes Analysis

Captured from full codebase engineering audit (2026-03-16).
For each codepath: one realistic production failure, test coverage, error handling, and user visibility.

---

## Critical Paths

### Stripe Webhook → Role Transition
**Failure:** Webhook replays same event twice (Stripe retries on timeout).
**Test:** Partial — tests reject invalid signatures, but no test for idempotent handling.
**Error handling:** `upsertSubscriptionFromWebhook()` uses upsert (idempotent by design) ✓
**User sees:** Nothing — upsert is safe. But if the upsert fails silently, user stays on wrong role.
**Verdict:** Low risk due to upsert, but **no test verifies the happy path or role transition**.

### Stripe Webhook → Unknown User
**Failure:** Subscription metadata missing `supabase_user_id`.
**Test:** No.
**Error handling:** Logs error and returns silently ✓
**User sees:** Nothing — subscription created in Stripe but no role change in TAG.
**Verdict:** ⚠️ Silent failure. User pays but doesn't get builder access. No alert mechanism.

### Taste Evaluate → Pipeline Timeout
**Failure:** 300s Vercel function limit hit during Claude research phase.
**Test:** No.
**Error handling:** Pipeline try/catch calls `setEvaluationError()`, but Vercel kills the function before catch runs.
**User sees:** Stuck progress bar. Retry button works but user doesn't know why.
**Verdict:** ⚠️ **Critical gap** — no test, no error handling for timeout, silent failure to user. (See TODO-22)

### Taste Evaluate → Claude API Failure
**Failure:** Anthropic API returns 500 or rate limit.
**Test:** No.
**Error handling:** Pipeline catch sets status to `error` with message ✓
**User sees:** Error message + "try again" prompt ✓
**Verdict:** Handled.

### Luma Webhook → Guest Email Not Found
**Failure:** Luma guest registers with email not matching any TAG user.
**Test:** No.
**Error handling:** `findUserByEmail()` returns null, handler exits silently ✓
**User sees:** Nothing — expected behavior for non-members.
**Verdict:** Handled. But no logging means you can't track unmatched guests.

### Luma Webhook → Event Not Found Locally
**Failure:** Luma sends guest.registered for an event not yet synced to TAG.
**Test:** No.
**Error handling:** Returns silently (no tagEvent found) ✓
**User sees:** Nothing — attendance not recorded. Will be picked up on next sync.
**Verdict:** Low risk but **attendance silently lost** if event never syncs.

### Lootbox Open → No Styles for Event
**Failure:** Event exists but has no lootbox_styles rows.
**Test:** No.
**Error handling:** Throws "No styles available for this event" ✓
**User sees:** Error toast ✓
**Verdict:** Handled.

### Lootbox Choose → Skin Generation Fails
**Failure:** Fal.ai Gemini Flash returns error during 2D generation.
**Test:** No.
**Error handling:** Pipeline catch sets skin status to `error` ✓
**User sees:** Error state with retry button ✓
**Verdict:** Handled.

### Lootbox → User Has No Photos
**Failure:** User opens lootbox and picks a card, but has no uploaded photos for the generation pipeline.
**Test:** No.
**Error handling:** Pipeline fetches photos, gets empty result — generation proceeds with no reference image.
**User sees:** Either a generic skin (no face reference) or an error.
**Verdict:** ⚠️ **No validation** that user has photos before allowing lootbox interaction. Could add a pre-check.

### Application Accept → Email Already Registered
**Failure:** Operator accepts application, but the email is already a Supabase auth user.
**Test:** No.
**Error handling:** Supabase `inviteUserByEmail()` will fail — error propagates to route → 500.
**User sees:** Operator sees error toast. Applicant gets no invite.
**Verdict:** ⚠️ **No specific handling** for duplicate email. Should check first or show a clear message.

### Registration → Profile Trigger Not Created
**Failure:** `signUp()` succeeds but the DB trigger that creates the profiles row fails.
**Test:** No.
**Error handling:** Subsequent `profiles.update()` will fail with "row not found" — caught and logged.
**User sees:** Registration appears to succeed, but profile is incomplete. Onboarding may fail.
**Verdict:** ⚠️ **Depends on DB trigger reliability**. If trigger fails, user is in a broken state with no recovery path.

### FAL Routes → Generation Timeout
**Failure:** Video generation (Veo 3.1) takes longer than 300s maxDuration.
**Test:** No.
**Error handling:** Vercel kills the function. `fal.subscribe()` was awaited, so no result returned.
**User sees:** Request hangs then fails. No specific timeout error message.
**Verdict:** ⚠️ Expected for long generations. Consider using Fal's async queue pattern instead of subscribe.

---

## Summary

| Path | Test | Error Handling | User Visibility | Status |
|------|------|---------------|-----------------|--------|
| Stripe webhook replay | No | ✓ (upsert) | Silent | OK |
| Stripe unknown user | No | ✓ (logs) | **Silent fail** | ⚠️ |
| Taste pipeline timeout | No | **No** (killed) | **Stuck UI** | ⚠️ CRITICAL |
| Taste API failure | No | ✓ | ✓ Error + retry | OK |
| Luma guest not found | No | ✓ | Silent (expected) | OK |
| Luma event not found | No | ✓ | **Silent loss** | ⚠️ |
| Lootbox no styles | No | ✓ | ✓ Error toast | OK |
| Lootbox skin gen fail | No | ✓ | ✓ Retry button | OK |
| Lootbox no photos | No | **No** | **Unknown** | ⚠️ |
| Application dupe email | No | **No** (500) | **Generic error** | ⚠️ |
| Registration trigger fail | No | Partial | **Broken state** | ⚠️ |
| FAL generation timeout | No | **No** (killed) | **Hang then fail** | ⚠️ |

**Critical gaps (no test + no error handling + silent/broken):**
- Taste pipeline timeout (TODO-22)
- Lootbox with no user photos
- FAL generation timeout
