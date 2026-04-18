# Profile restructure · implementation plan

**Mockup:** `design-mockups/profile-b-refined.html`
**Brief:** `design-mockups/profile-restructure-briefing.md`

## Scope summary
- `/portal/profile` becomes 3 tabs: **Overview · Identity · Account**
- `/portal/taste` → redirects to `/portal/profile?tab=identity`
- `/profile/[slug]` reads `builder_profiles` honoring `show_*` flags + skin
- `/builders/[slug]` → redirects to `/profile/[slug]`
- AI pipeline becomes invisible scaffolding (no badges/regenerate in user UI)

---

## Decision flagged up-front

**Are AI-generated fields user-editable, or AI-only + visibility-only?**

Currently: `building`, `why_tag`, `socials`, `name` are user-editable. The
`builder_profiles` fields (`headline`, `bio`, `tags`, `projects`,
`interests`, `notable_work`, `influences`, `key_links`) are **not** — only
the pipeline writes them, users can only toggle `show_*`.

"Invisible scaffolding" implies edits should work on every field — the
mockup shows edit buttons on all of them.

Three ways to answer this:

| Path | Scope | What ships |
|---|---|---|
| **Full editability** | Large | New API + mutations + dialogs for each field (incl. array editors for projects/links). Scaffolding truly invisible. |
| **Visibility-only (v1), edits later** | Small | Ship tab restructure + unified public page now. Every AI field has only the eye toggle. Edit buttons appear only on profiles fields. |
| **Split editability** | Medium | Headline + bio get text edits (high value, low effort). Arrays (projects/tags/etc.) stay AI+visibility only for now. |

**Recommendation: start with "visibility-only (v1), edits later".** The big
unlock is the tab + public-profile work; adding arbitrary edits for
nested arrays is a rabbit hole and ships slower. Edit buttons on AI fields
render as "Regenerate" (admin-only) or are omitted for users.

The plan below assumes v1 = visibility-only. Flag if you disagree — it
changes stage 3.

---

## Staging (ship each stage independently)

### Stage 1 · Unify the public profile
**Why first:** biggest external value, no portal changes, independent of tab work.

**Files to create/modify:**
- `lib/auth/types.ts` — extend `PublicProfile` to include builder_profiles fields
- `lib/auth/queries.ts` — `getPublicProfile` joins `builder_profiles` where `status='complete'`, respects `show_*` flags
- `app/profile/[slug]/page.tsx` — render new sections (headline, bio, tags, projects, notable_work, key_links, skin/equipped_skin)
- `app/builders/[slug]/page.tsx` — replace body with `redirect('/profile/${slug}')`
- Keep `/builders` root page intact for marketing list, but individual builder pages redirect

**Data shape:**
- `getPublicProfile(slug)` returns `profiles` row + optional `builder_profiles` row (only `show_*=true` fields surfaced) + equipped skin URL
- Skin URL: read from `user_skins` where `equipped=true`, fall back to `builder_profiles.skin_url`

**Tests:**
- `tests/routes/public-profile.test.ts`: GET `/profile/tijs-nieuwboer` returns 200, includes name, hides tags when `show_tags=false`, shows projects when `show_projects=true`
- `tests/routes/builders-redirect.test.ts`: GET `/builders/tijs-nieuwboer` returns 307/308 to `/profile/tijs-nieuwboer`

---

### Stage 2 · Portal tab shell
**Why second:** reorganizes existing pieces into tabs without new data or editing.

**Files to create/modify:**
- `lib/portal/components/profile-tabs.tsx` — new client component using shadcn Tabs, reads `?tab=` query for deep-linking
- `app/portal/profile/page.tsx` — becomes an orchestrator: fetches all data, renders tabs, delegates to three sub-components
- `lib/auth/components/profile-overview-tab.tsx` — hero + lootbox + stats + membership + timeline
- `lib/auth/components/profile-identity-tab.tsx` — v1: socials + building/why_tag editors + AI sections with visibility toggles
- `lib/auth/components/profile-account-tab.tsx` — name + email + signout
- `app/portal/taste/page.tsx` — replace with `redirect('/portal/profile?tab=identity')`

**Key compositional moves from existing code:**
- Hero card, socials, lootbox progress, skins collection → Overview tab
- `MembershipCard` + `UpgradeCard` + `ClaimPendingNotice` → Overview tab (as the membership row)
- `ProfileEventTimeline` → Overview tab
- `EditProfileForm` (building/why_tag) + `SocialLinks` + existing taste visibility toggles → Identity tab
- `EditNameForm` + email + `SignOutForm` → Account tab

**Lootbox prominence (non-negotiable):**
- Overview tab: `LootboxFeature` component wraps `LootboxOpening`
- When `availableLootboxCount > 0`: loud block directly under hero column (orange border, glow, large icon, CTA button)
- When count = 0 and no pending: small quiet row "No lootboxes waiting"
- When `lootboxAllDone` but never awarded: existing `LootboxProgress` UI

**Tests:**
- `tests/e2e/portal-profile-tabs.test.ts`: user lands on Overview by default, clicks Identity tab, sees visibility toggles; `/portal/profile?tab=account` lands on Account directly
- `tests/routes/taste-redirect.test.ts`: GET `/portal/taste` → 307 to `/portal/profile?tab=identity`

---

### Stage 3 · Invisible scaffolding (v1: visibility-only)
**Why third:** polish on top of the new structure.

**Files to modify:**
- `lib/taste/components/profile-card.tsx` — strip AI-source chips (`data_sources` display)
- `lib/auth/components/profile-identity-tab.tsx` — render each AI section as a plain field card (headline → big text, bio → paragraphs, tags/projects/etc.) with only eye toggle visible to members; no "Regenerate" CTA
- `lib/taste/components/profile-prompt.tsx` — simplify into a one-time first-run banner; remove the "Your builder profile will be generated…" marketing copy
- `lib/taste/components/profile-progress.tsx` — convert to a slim banner embedded at top of Identity tab (spin icon + "Building your profile…")
- Identity tab: when `builder_profile.status !== 'complete'`, show shimmer skeletons on AI-fillable cards (see mockup first-run state)

**First-run UX:**
- Banner at top of Identity tab: "Building your profile… — we're researching your public presence to fill out your bio, tags and projects."
- Fillable AI fields show shimmer bars
- Editable user fields (building, why_tag, socials) remain fully interactive
- When status flips to `complete`, toast: "Your profile is ready."

**Admin-only regenerate:**
- `lib/people/components/member-list.tsx` — add a "Regenerate profile" action per-member row (super-admin only, gated by `is_super_admin`)
- API route `POST /api/admin/taste/regenerate` — service-role, re-runs pipeline for a user
- Nothing user-facing for regeneration in v1

**Tests:**
- `tests/e2e/identity-first-run.test.ts`: a user with `builder_profiles.status='researching'` sees the banner + skeletons in Identity tab
- `tests/routes/admin-regenerate.test.ts`: non-super-admin POST returns 403; super-admin POST returns 200 and updates row status to 'pending'

---

### Stage 4 · Cleanup
**Files to delete after stages 1-3 ship:**
- `lib/taste/components/profile-page-client.tsx` — replaced by identity tab
- `lib/taste/components/profile-card.tsx` — pieces merged into identity tab
- `lib/taste/components/profile-visibility.tsx` — pieces merged into identity tab
- `lib/taste/components/profile-prompt.tsx` — replaced by banner

**Keep:**
- `lib/taste/pipeline/**` (pipeline code)
- `lib/taste/queries.ts`, `mutations.ts`, `schema.ts`, `types.ts`, `hooks.ts`
- `app/api/taste/**` (status, visibility, evaluate — still needed)

---

## Data & migration notes

- **No DB schema changes needed** for v1. All existing `builder_profiles`
  columns and `show_*` flags are sufficient.
- **`/profile/[slug]` slug collisions**: `getPublicProfile` already does
  case-insensitive name match. Still no collision handling (two Tijses).
  Out of scope for this refactor — flag as a known issue.
- **Redirects**: implement as `redirect()` in page files (307 by default in
  Next 15). No middleware needed.

---

## Component/file diff summary

### New
- `lib/portal/components/profile-tabs.tsx`
- `lib/auth/components/profile-overview-tab.tsx`
- `lib/auth/components/profile-identity-tab.tsx`
- `lib/auth/components/profile-account-tab.tsx`
- `lib/auth/components/identity-field-card.tsx` (reusable section card with eye toggle + optional skeleton)
- `lib/auth/components/lootbox-feature.tsx` (loud/quiet block)
- `lib/auth/components/first-run-banner.tsx`
- `app/api/admin/taste/regenerate/route.ts`

### Modified
- `app/portal/profile/page.tsx` (orchestrator)
- `app/portal/taste/page.tsx` (→ redirect)
- `app/profile/[slug]/page.tsx` (adds builder_profiles data + skin)
- `app/builders/[slug]/page.tsx` (→ redirect)
- `lib/auth/queries.ts` (extend `getPublicProfile`)
- `lib/auth/types.ts` (extend `PublicProfile`)
- `lib/people/components/member-list.tsx` (add regenerate action)

### Deleted (stage 4)
- `lib/taste/components/profile-page-client.tsx`
- `lib/taste/components/profile-card.tsx`
- `lib/taste/components/profile-visibility.tsx`
- `lib/taste/components/profile-prompt.tsx`
- `lib/taste/components/profile-progress.tsx`

---

## Tests

Following the CLAUDE.md convention (`tests/e2e/` + `tests/routes/`):

- `tests/routes/public-profile.test.ts` — unified public profile with visibility flags
- `tests/routes/builders-redirect.test.ts` — `/builders/[slug]` redirects
- `tests/routes/taste-redirect.test.ts` — `/portal/taste` redirects
- `tests/routes/admin-regenerate.test.ts` — admin-only regenerate endpoint
- `tests/e2e/portal-profile-tabs.test.ts` — tab switching + deep-linking via `?tab=`
- `tests/e2e/portal-profile-lootbox-prominence.test.ts` — loud block when boxes > 0, quiet block when 0
- `tests/e2e/identity-first-run.test.ts` — banner + skeletons when pipeline is running

All stages gated on `pnpm typecheck && pnpm lint && pnpm test` passing.

---

## Risks & open questions

1. **Edit scope for AI fields** — flagged above. If we want headline/bio
   edits in v1, add ~half a stage.
2. **Lootbox position in Overview** — under hero (left column) vs. top of
   right column. Mockup shows right column; I'd test both in dev before
   locking in.
3. **First-run banner placement** — above Identity tab intro, or
   inline-above-skeletons? Mockup shows above intro.
4. **What if the pipeline errors?** Current behavior shows a red "Previous
   attempt failed" notice. In v1 we'd surface the same thing as a
   persistent banner with "contact an admin" — no user-facing retry. Admin
   regeneration covers retries.
5. **Backward-compat for direct `/portal/taste` links in emails** — the
   taste-complete and taste-failed email templates link to `/portal/taste`.
   Redirect handles this transparently, but we should also update the
   template links to `/portal/profile?tab=identity`.

---

## Rough sizing
- Stage 1: ~4-6 hours (data extension + public page + redirect + tests)
- Stage 2: ~6-8 hours (tabs + composition + redirects + tests)
- Stage 3: ~4-6 hours (first-run + scaffolding cleanup + admin regen + tests)
- Stage 4: ~1 hour (file deletions + imports)

Total ~2-3 focused days if stages ship sequentially.
