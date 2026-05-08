# Onboarding milestones + Prophecy · working plan

**Status:** active plan. Update checkboxes and `Last updated` line as
work progresses. Designed to be read cold — if you open a fresh session
and need to continue, read this file top-to-bottom and you will have
enough context.

**Last updated:** 2026-04-23 (phase 7 rework: adaptive 3-round draw + pixel-art imagery)
**Related docs:**
- `design-mockups/onboarding-milestones-brainstorm.md` — the "why"
- `design-mockups/taste-pipeline-forward.md` — predecessor to prophecy
- `design-mockups/profile-restructure-plan.md` — already-shipped prior work

---

## 1 · What we're building

Onboarding becomes a staged ritual with five tiers. Each tier has its
own reveal moment. The headline feature is **the Prophecy** — a
tarot-card reveal that replaces the old "AI wrote your bio" approach.
Members draw 3 cards from AI-generated suits, and those cards form
their forward-looking public statement.

### The five tiers (locked in)

| # | Name | Trigger | Reveal |
|---|------|---------|--------|
| 1 | **Arrived** | Signup + email confirm | Portal access |
| 2 | **Sparked** | building + why_tag + ≥1 social URL filled | AI pipeline auto-triggers; Identity tab shows "reading about you" state |
| 3 | **Prophecy** | Pipeline completes | **Tarot reveal — draw 3 cards** |
| 4 | **Embodied** | 3 reference photos uploaded | **First lootbox** → skin |
| 5 | **Present** | First event check-in | Second lootbox + skin |

### Locked-in decisions

- **Prophecy comes before lootbox.** Text-first win before photo-first win.
- **Lootbox gating:** first lootbox only unlocks when tiers 1-4 are all
  complete. Photos can be uploaded earlier but lootbox stays locked
  until the prophecy is drawn.
- **Format = tarot**, not a multiple-choice list. Card draw ritual with
  flip reveal and explicit "pick 3" mechanic.
- **Member agency:** AI proposes, member chooses. The 3 chosen cards
  become the public statement; unchosen cards are discarded.
- **Refresh window:** once every ~6 months a member can redraw
  (or on a milestone like 10 events).

---

## 2 · Open questions (answer before coding)

Each needs a decision before the relevant work can start. Some have
provisional answers — confirm or override.

- [ ] **How many suits and what are they?**
      Provisional: 4 suits — The Field, The Method, The Audience, The Arc.
      Alternative: 3 (drop Audience) for shorter narrative.
- [ ] **Pick-any-3 or one-from-each-suit?**
      Provisional: one from each of 3 chosen suits. Forces variety.
- [ ] **How many cards total in the deck?**
      Provisional: 12-15 (3-4 per suit). AI generates fresh each draw.
- [ ] **Where does the Prophecy UI live?**
      Options: full-screen takeover when pipeline completes · dedicated
      `/portal/prophecy` page · inline modal on Identity tab.
      Provisional: full-screen takeover on first draw, then redraw is a
      modal from Identity tab.
- [ ] **Redraw lock window?**
      Provisional: 60 days before a member can redraw. Prevents gaming
      cards for the best headline.
- [ ] **Card visual style?** (design question, parallel to prompt work)
      Needs a design pass. Suit colors, glyphs, typography.
- [ ] **Pipeline cost/model choice?**
      15 cards × rich narrative > current bio output. Needs estimate.

---

## 3 · Work breakdown

### Phase 0 · Prompt R&D ◐ (script shipped, validation pending)

**Goal:** prove we can generate good card content before doing any UI work.

- [x] Standalone script `scripts/prophecy-prompt-test.ts` takes a
      `<email|name>` arg, loads `builder_profiles`, and prompts Claude
      Sonnet 4.6 for a 14-card deck across 4 suits (field / method /
      audience / arc). No DB writes.
      Usage: `pnpm tsx scripts/prophecy-prompt-test.ts tijs@lerai.nl`
- [x] First run on Tijs — quality is strong on first iteration.
      Observations (2026-04-18):
      - Cards are specific, grounded in the existing profile, distinct
        per suit, varied in confidence.
      - Bias toward stale source data (e.g. Beeckestijn lectures
        surface in 2 cards) — this is inherited from the old
        `builder_profile` and should resolve once the forward-looking
        pipeline from `taste-pipeline-forward.md` lands.
      - Model produced 15 cards (4+4+4+3) vs. requested 14. Acceptable.
- [x] ~~Run on 3-5 other real profiles (volunteers from TAG)~~.
      **Cut 2026-04-18:** only 1 complete `builder_profile` exists in
      prod (Tijs). Other 3 signups have no pipeline run yet. Instead of
      blocking on volunteer recruitment, we iterate on Tijs' profile as
      the single test case.
- [ ] **New exit criterion:** 3 consecutive runs on Tijs' profile
      produce decks where he would happily keep 3 cards without
      rewriting, AND no single pair of cards feels like a dupe.
      Runs logged in `design-mockups/prophecy-runs/`.
- [ ] Tune prompt for per-suit distinctness (run 02 showed Keyboard
      Undertaker and Ambient Stack Builder overlap inside THE FIELD).
- [ ] Once a new member gets a complete builder_profile, re-run as a
      cheap sanity check before locking.
- [ ] Once validated, lock in prompt as final for phase 1 integration.

### Phase 1 · Schema + pipeline plumbing ✅

- [x] Migration `20260418120000_add_prophecy_to_builder_profiles.sql`
      adds `prophecy_deck jsonb`, `prophecy_chosen jsonb`,
      `prophecy_drawn_at timestamptz`, `show_prophecy boolean default true`.
      Applied to prod (TAG Supabase).
- [x] `lib/taste/pipeline/prophecy.ts` generates decks via Sonnet 4.6.
- [x] `lib/taste/pipeline/run.ts` now runs prophecy as a phase 3 after
      profile save. A prophecy failure is non-fatal — the member still
      gets a complete bio/tags.
- [x] `scripts/prophecy-backfill.ts` for one-off generation on
      already-complete profiles. Tijs backfilled on 2026-04-18.
- [x] Added `POST /api/taste/prophecy/draw` — self (with 60-day gate)
      or super admin.
- [x] Added `POST /api/taste/prophecy/pick` — accepts 3 card IDs,
      resolves against deck server-side to prevent spoofing, writes
      `prophecy_chosen` and `prophecy_drawn_at`.

### Phase 2 · Prophecy reveal UI ✅

- [x] `lib/taste/components/prophecy-reveal.tsx` — full-screen
      takeover, face-down cards per suit, flip-on-click via CSS 3D
      backface, "pick 3" running counter, Seal the prophecy CTA.
- [x] Suit-themed colors + glyphs (field=orange ◈, method=amber ◇,
      audience=emerald ◉, arc=violet ☉).
- [x] Mounted on Identity tab: draw CTA shows when
      `prophecy_deck && !prophecy_chosen`; chosen cards render as a
      FieldCard with visibility toggle once picked.
- [ ] Animation pass beyond flip (shake-into-position, final reveal) —
      defer; feel out need during dogfood.

### Phase 3 · Public prophecy statement ✅

- [x] `PublicTaste` type extended with `prophecy: ProphecyCard[] | null`.
- [x] `getPublicTaste()` respects `show_prophecy` flag, reads
      `prophecy_chosen`.
- [x] `/profile/[slug]` renders chosen cards as a 3-up grid above the
      Bio section.
- [x] Visibility toggle added to Identity tab (`show_prophecy` in
      `VISIBILITY_OPTIONS`).

### Phase 4 · Milestone tracking UI ✅

- [x] `lib/milestones/tiers.ts` — `computeTier()` derives tier (Arrived
      → Sparked → Prophecy → Embodied → Present) from onboarding
      profile, builder profile, photo count, checked-in count. Returns
      label, tagline, next-step hint, progress index.
- [x] `lib/milestones/components/tier-badge.tsx` — tier card with
      progress bar and per-tier color.
- [x] Mounted on Overview tab left column below socials.
- [ ] Per-tier transition celebration (toast + confetti) — defer to
      phase 6 (future polish). Silent tier changes for now.

### Phase 5 · Redraw mechanic ✅

- [x] Redraw button on Identity tab prophecy card; clicks
      `/api/taste/prophecy/draw`. Backend gates: 60 days for members,
      super admin bypasses.
- [x] Reveal modal auto-opens after successful redraw.
- [x] Helper `formatDrawnAt()` shows "X days/months ago" under chosen
      cards.
- [ ] Prophecy archive / retrospective view — deferred (plan said
      phase 5 stretch goal).

### Phase 6 · Admin tooling ⬜

- [ ] Admin regenerate (exists via `/api/taste/evaluate`) already
      produces new decks. Confirm it clears `prophecy_chosen`.
- [ ] Admin ability to preview a member's deck without their consent
      (debugging tool) — optional.

---

## 4 · Where code lives

Fresh-session pointers:

- **Existing taste pipeline:** `lib/taste/pipeline/` (run.ts, formatter, research)
- **Existing mutations/queries:** `lib/taste/mutations.ts`, `lib/taste/queries.ts`
- **Schema:** `lib/taste/schema.ts` + `lib/taste/types.ts`
- **Identity tab (where prophecy UI will land):** `lib/auth/components/profile-identity-tab.tsx`
- **Public profile (where chosen prophecy renders):** `app/profile/[slug]/page.tsx`
- **Public profile query:** `lib/auth/queries.ts` → `getPublicProfile`
- **Existing migrations:** `supabase/migrations/` — newest is the photos work
- **Overview tab (for milestone progress UI):** `lib/auth/components/profile-overview-tab.tsx`

---

## 5 · Not in scope (deferred)

- **Comments on member profiles** — own feature, own plan doc needed
- **Streak / event-based rewards beyond tier 5** — already partially built
- **Prophecy retrospective view** — phase 5 stretch goal
- **Card illustrations/artwork** — needs design resources; launch with
  typography-only cards

---

## 6 · Next step right now

**Dogfood the full flow on Tijs' profile, then polish.** The code
for phases 1-5 is shipped end-to-end, Tijs' deck is backfilled
(2026-04-18). Open `/portal/profile` → Identity tab → click "Draw
the cards" → pick 3 → confirm → verify chosen cards render on
Identity, Overview tier badge updates, `/profile/tijs-nieuwboer`
public page shows them.

Things likely to need iteration after dogfood:
- Reveal modal density / card readability on mobile.
- Whether the "Redraw" button belongs here or should be more hidden.
- Tier badge placement (currently left column under socials) — might
  want to be more hero-level.
- The "flip all" shortcut — might make the flip ritual feel pointless;
  consider removing.

**Iterate the prompt against Tijs' profile** (original phase 0 work
continues in parallel):

Concrete next moves:
1. Pick one dimension of the prompt to change (start with **per-suit
   distinctness** — run 02 had two cards in THE FIELD that were
   essentially the same voice-first prediction in different words).
2. Edit `buildPrompt()` in `scripts/prophecy-prompt-test.ts`.
3. Run `pnpm tsx scripts/prophecy-prompt-test.ts tijs@lerai.nl`.
4. Save the deck as `design-mockups/prophecy-runs/<date>-tijs-run-NN.md`
   with observations + which 3 cards Tijs would keep.
5. Repeat until 3 consecutive runs hit the new exit criterion
   (section 3, phase 0). Then lock the prompt.

Known prompt-quality debt that does NOT block phase 1:
- The model inherits stale data from the old `builder_profile` (e.g.
  Beeckestijn still leaks through in run 02). The fix is the
  forward-looking pipeline work from `taste-pipeline-forward.md`,
  which is a parallel track.
- When a second member gets a `builder_profile`, do one cheap
  sanity-check run on them before locking — catches if we've
  overfit to Tijs.

---

## 7 · Phase 7 rework — adaptive rounds + pixel art ◐

**Decision 2026-04-23:** the "draw the whole deck, pick 3" ritual is too
flat and the cards come out too literal ("you'll do more marathons"). We
want a funnel: concrete → underlying drive → mythic vision. Shape the
draw as three adaptive rounds, each shaped by the prior pick, each
culminating in a card with a pixel-art gaming image.

### Locked-in changes
- **3 rounds × 4 cards.** End with exactly 3 chosen cards (one per round).
- **Drop the 4-suit model.** Suits were dead weight under the adaptive
  scheme. Replace with round semantics:
  - Round 1 · **Surface** — observable patterns in current work.
  - Round 2 · **Undercurrent** — what's actually driving those patterns.
  - Round 3 · **Horizon** — the impossible/mythic version of where this
    leads. Explicitly abstract.
- **Each round is generated on demand**, conditioned on prior picks.
  Round 1 uses the full profile; round 2 gets round-1 pick; round 3 gets
  rounds 1-2 picks.
- **Pixel-art gaming images per card.** `fal-ai/flux/schnell` (~1-2s,
  ~$0.003/image). Style prompt baked in: 16-bit SNES-era fantasy RPG
  card illustration, dark mystical background, tag-orange palette. 12
  images per full run ≈ $0.04.
- **Full-screen modal (real Dialog).** Not a panel takeover — so we can
  open it from Overview tier-badge too, not just Identity tab.
- **Magic loading between rounds.** Latency of the generate step is the
  ritual — don't hide it, theatre it. Shuffle/deck animation + copy
  that gives it meaning ("the deck reshuffles around your choice…").

### Schema change
Drop `prophecy_deck` (single-shot 14-card JSON, now obsolete).
Add:
- `prophecy_rounds jsonb` — `[{ cards: Card[], picked_id: string|null }, …]`
  Live state of the draw. `cards` each have `{id, round, title,
  narrative, image_url}`. Exactly 3 entries when sealed.
Keep: `prophecy_chosen`, `prophecy_drawn_at`, `show_prophecy`.

New Supabase storage bucket: `prophecy-images` (public read).

### API surface
- `POST /api/taste/prophecy/draw` — gated by 60-day redraw window. Resets
  `prophecy_rounds` + generates round 1 (text + 4 images in parallel).
- `POST /api/taste/prophecy/advance` — body `{ pickedCardId }`. Validates
  against the unsealed round, writes the pick, generates next round or
  finalises `prophecy_chosen` + `prophecy_drawn_at` on round 3.
- Retire `/api/taste/prophecy/pick` (replaced by /advance).

### Pipeline changes
- `runProfilePipeline` stops auto-generating a prophecy deck at signup.
  The first draw only happens when the member taps "draw the cards" on
  Identity tab. (The old approach pre-generated 14 cards that most
  members never looked at.)
- `lib/taste/pipeline/prophecy.ts` becomes `generateRound(profile,
  priorPicks, roundIndex)` → 4 text cards.
- `lib/taste/pipeline/prophecy-image.ts` new — `generateCardImage(card)`
  → pixel PNG, uploaded to `prophecy-images/{userId}/{cardId}.png`,
  returns public URL. All 4 images fired in parallel per round.

### Tests
- `tests/routes/prophecy-draw.test.ts` — start new draw, 60-day gating.
- `tests/routes/prophecy-advance.test.ts` (new) — pick through 3
  rounds, reject invalid card id, reject picking already-sealed round,
  finalisation writes `prophecy_chosen`.

### Work breakdown
- [x] Plan locked (this section).
- [ ] Migration `20260423130000_prophecy_adaptive_rounds.sql`.
- [ ] Types + schema: replace `ProphecyDeck`/suits with
      `ProphecyRound`/`ProphecyCard` (+ image_url, round).
- [ ] Backend `prophecy.ts` + `prophecy-image.ts`.
- [ ] API routes `draw` + `advance`.
- [ ] Rewrite `ProphecyReveal` as Dialog modal with round stepper +
      magic loading.
- [ ] Update Identity tab + public profile to new card shape.
- [ ] Tests, typecheck, lint.
- [ ] Retire `scripts/prophecy-backfill.ts` / update to new shape.
- [ ] Dogfood on Tijs' profile (drop old deck, redraw).

---

## 8 · How to use this doc in future sessions

1. Read this file top-to-bottom.
2. Find the first unchecked box in section 3.
3. If blocked by an open question in section 2, answer that first with
   the user.
4. Do the work. Update the checkbox.
5. Bump `Last updated` at the top.
6. If you discover a new open question, add it to section 2.
7. If you finish a phase, add what was shipped + file pointers to a new
   "Shipped" section at the bottom.
