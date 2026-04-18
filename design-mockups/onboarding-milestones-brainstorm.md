# Onboarding milestones + Prophecy ritual · brainstorm

**Status:** design brainstorm, no code yet. Captured 2026-04-18.
**Related:** `taste-pipeline-forward.md` (predecessor — this refines it).

## The idea in one line

Turn onboarding from "fill in six fields → get lootbox" into a **staged
ritual** where each milestone has its own reveal moment, and the
forward-looking dimension is delivered as a **tarot-like Prophecy** that
the member draws themselves.

## The five tiers

Each tier = a milestone with: a trigger (what the user does), a reveal
(what TAG gives back), and a next CTA.

| # | Name | User does | Reveal | Next |
|---|------|-----------|--------|------|
| **1** | **Arrived** | Signup + email confirm | Portal access, welcome screen | "Tell us what you're building" |
| **2** | **Sparked** | Fills building + why TAG + ≥1 social URL | **AI pipeline auto-triggers.** Identity tab shows "we're reading about you, takes ~1 min" | Wait for the Prophecy |
| **3** | **Prophecy** | *Nothing* — AI has done its work | **Tarot reveal** — draw your cards (see below) | "Upload 3 photos to unlock your skin" |
| **4** | **Embodied** | Uploads 3 reference photos | **First lootbox** → skin opening ritual | "Come to your first event" |
| **5** | **Present** | Checks in at first event | Second lootbox + new skin | Streak/attendance rewards (existing) |

## The lootbox gating rule

**First lootbox is granted only when tiers 1-4 are all complete.** Even
if a member uploads photos before their Prophecy is ready, the lootbox
stays locked until the full ritual is done. This preserves the narrative
order: prophecy (AI sees you) → photos (you show yourself) → lootbox
(TAG rewards the commitment).

## The Prophecy as tarot

Instead of a dropdown of predictions, the reveal is a **card-drawing
ritual**.

### Mechanic

1. Pipeline generates ~12-15 personalized cards from the research output
2. Cards are split into **suits** (categories):
   - **The Field** — domain / craft (voice-first, AI-for-non-engineers, design systems, …)
   - **The Method** — how they work (ships in public, long-form thinking, community-led, …)
   - **The Audience** — who they serve (non-engineers, founders, designers, …)
   - **The Arc** — where it leads (platform, movement, tool, institution, …)
3. The member sees their hand face-down. Clicks to flip each one.
4. Each card has: a **title** ("The Voice-First Pioneer"), a short
   **narrative** (1-2 sentences), an illustration/glyph.
5. Member picks **3 cards** (or 1 from each of 3 suits — decide).
6. The chosen cards combine into a **sentence** on their profile:
   *"A voice-first pioneer, shipping in public, for people who don't
   code."*
7. That sentence becomes their forward-looking public statement.

### Why this is a good format

- **Agency** — the AI proposes, the member chooses. Not "here's who
  the AI thinks you are" but "here's who I'm claiming to be".
- **Replayable** — you can redraw (maybe once every 6 months) and
  refresh your narrative.
- **Shareable** — cards are visual, designed to be screenshot/posted.
  "Check my TAG prophecy" becomes a thing.
- **TAG-flavored** — matches the greatness/ambition tone. Ritual over
  form-fill.

### Suits design — open

- Are 4 suits right? Could be 3 (Field / Method / Arc), could be 5.
- Do we force "one from each suit" or let the member pick any 3 freely?
- How do we make sure the cards are good? Prompt quality matters enormously.
- What does a card *look like*? Needs design work — typography, glyph,
  color per suit.

## Refresh / retrospective

Every ~6 months (or on a milestone like 10 events attended), offer a
**re-draw**. "Your last prophecy was from October. Want to pull new
cards?"

This keeps the forward-looking content fresh and gives members a reason
to come back — a small ritual tied to time.

Could also work: **retrospective**. Show the old prophecy alongside
current activity. *"You drew The Voice-First Pioneer in January.
Shipped Hypes, ran the Marathon demo, gave 3 talks. Looks like that one
was real."*

## Comments on member profiles — followup

Separate feature but worth noting now. Members could leave short notes
/ endorsements / reactions on each other's profiles — visible on the
public `/profile/[slug]` page.

### Why it matters for onboarding

- **Slows down onboarding** in a good way — instead of blasting through
  six fields, you're engaging with the community before you're fully
  "arrived"
- **Creates social proof** — a profile with 3 comments feels more alive
  than a blank one
- **Reciprocity loop** — someone comments on your profile, you feel the
  pull to comment back

### Where it sits in the journey

Could be a **tier 6** or a side-quest — "leave a comment on 3 member
profiles" as an optional milestone with its own reward (unlocks a rare
skin? gets you early access to events?).

### Scope flag

This is its own feature — needs DB table, moderation model, notifications,
rate limiting, probably a `comments` module. Deserves its own plan doc.
Not blocking the milestone work.

## Open questions (to settle before implementation)

1. **Prophecy UI placement** — full-screen modal, dedicated `/portal/prophecy`
   page, or revealed inline on Identity tab?
2. **What if pipeline fails?** — error state in Identity tab, retry via
   admin regen (already built). Prophecy delayed.
3. **Pipeline cost** — generating 15 tarot cards costs more tokens than
   the current bio+tags. Rough estimate + model choice needed.
4. **Can you redraw immediately?** — or is first-draw locked for X days?
   Redraw-locking prevents gaming the cards for the best headline.
5. **Suits visuality** — does design work come first (what does a card
   look like) or does the prompt/content come first?
6. **Comments feature sizing** — deferred to its own plan doc.

## Rough implementation sizing

- Pipeline changes (generate tarot cards instead of single bio) —
  2-4 hours incl. prompt iteration
- Schema: `prophecy_cards jsonb`, `prophecy_chosen text[]` on
  `builder_profiles` — 15 min
- UI: reveal modal + card flip animation + selection — 4-6 hours
- Redraw logic + 6-month timer — 1-2 hours
- Milestone tracking (tier computation + Portal header "you're at tier
  X") — 2-3 hours
- Copy + card design — depends on design pass

**Rough total: 2-3 focused days** for the core ritual, plus design time
for card visuals.

## What I am NOT designing yet

- The actual card content / taxonomies (domain-specific, needs
  editorial pass)
- The comments feature (own plan)
- Streak / attendance reward expansions (already partially built)
- Any event-based milestones beyond tier 5 baseline

## Next step if we want to ship this

Either:
- (a) **Design the card** — what does one look like? Work up 2-3 in HTML
  mockup form, then figure out the prompt that generates them.
- (b) **Prompt first** — get the AI generating great card content on a
  throwaway script, then design the visual around what it outputs.

My lean: **(b) first, (a) second**. The card design has to serve the
content, not the other way around. If the AI can't generate great card
content, the design work is wasted.
