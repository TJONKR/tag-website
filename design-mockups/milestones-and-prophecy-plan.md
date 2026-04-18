# Onboarding milestones + Prophecy · working plan

**Status:** active plan. Update checkboxes and `Last updated` line as
work progresses. Designed to be read cold — if you open a fresh session
and need to continue, read this file top-to-bottom and you will have
enough context.

**Last updated:** 2026-04-18 (planning phase — no code started)
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

### Phase 0 · Prompt R&D ⬜

**Goal:** prove we can generate good card content before doing any UI work.

- [ ] Write a standalone script `scripts/prophecy-prompt-test.ts` that
      takes a known profile (start with Tijs — existing `builder_profile`)
      and generates a candidate deck of 12-15 cards.
- [ ] Iterate on prompt until output is consistently:
      - Personal (specific, not generic "you're a builder")
      - Distinctive between cards (not 4 variants of the same thing)
      - Good one-line title + 1-2 sentence narrative per card
      - Sliceable into suits
- [ ] Run on 3-5 other real profiles (pick volunteers from TAG) to
      confirm it's not just good for Tijs.
- [ ] **Exit criterion:** at least 3 of 5 test profiles produce a deck
      where the tester would happily keep 3 cards without rewriting.

### Phase 1 · Schema + pipeline plumbing ⬜

- [ ] Migration: add to `builder_profiles`:
      ```
      prophecy_deck      jsonb      -- {suits: {field:[...], method:[...], ...}}
      prophecy_chosen    jsonb      -- array of 3 picked card IDs with narratives
      prophecy_drawn_at  timestamptz
      show_prophecy      boolean default true
      ```
- [ ] Update `lib/taste/pipeline/` to call the card-generation prompt
      and save the deck.
- [ ] Keep existing `headline` and `bio` for backward compat — they
      still surface when prophecy hasn't been drawn yet.

### Phase 2 · Prophecy reveal UI ⬜

- [ ] New component: `lib/taste/components/prophecy-reveal.tsx`
      - Full-screen modal/takeover
      - Face-down cards → tap/click to flip
      - "Pick 3" selector with running count
      - Confirm button → saves choice
- [ ] Card component with suit-specific styling
- [ ] Animation pass (flip, shake-into-position, final reveal)
- [ ] Show on Identity tab when `prophecy_deck` exists and
      `prophecy_chosen` is null.

### Phase 3 · Public prophecy statement ⬜

- [ ] Update `/profile/[slug]` to render the 3 chosen cards as a
      visual block (probably under the headline, above bio).
- [ ] Add `show_prophecy` visibility toggle to Identity tab.
- [ ] Update `PublicProfile` type in `lib/auth/types.ts`.

### Phase 4 · Milestone tracking UI ⬜

- [ ] Compute current tier from profile state (query helper).
- [ ] Show tier progress indicator somewhere — Overview tab? Small
      portal header badge? Needs design.
- [ ] Each tier reveal gets its own component; at transition show a
      subtle celebration (toast + confetti-lite animation).

### Phase 5 · Redraw mechanic ⬜

- [ ] Redraw button on Identity tab (enabled after `prophecy_drawn_at`
      is >60 days ago).
- [ ] Redraw path reuses the same pipeline + reveal modal.
- [ ] Decide: does the old prophecy archive somewhere? (Retrospective
      feature — "you drew X in January, Y today").

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

**Start phase 0 — prompt R&D.** Write a throwaway script that generates
a deck from Tijs's existing `builder_profile`. Iterate until the output
is genuinely good. Nothing else starts until the prompt produces
content worth drawing.

Concrete first move:
```
scripts/prophecy-prompt-test.ts
```
Reads a `user_id` from CLI, calls an LLM with the prophecy prompt and
the user's profile data, prints the deck as JSON. No DB writes, no
pipeline integration. Just prove the content.

---

## 7 · How to use this doc in future sessions

1. Read this file top-to-bottom.
2. Find the first unchecked box in section 3.
3. If blocked by an open question in section 2, answer that first with
   the user.
4. Do the work. Update the checkbox.
5. Bump `Last updated` at the top.
6. If you discover a new open question, add it to section 2.
7. If you finish a phase, add what was shipped + file pointers to a new
   "Shipped" section at the bottom.
