# Profile restructure · decision brief

## Context
Deciding how to untangle three overlapping profile surfaces in the TAG portal
(`/portal/profile` kitchen-sink page, orphaned `/portal/taste` with AI
enrichment + visibility toggles, weak `/profile/[slug]` public page that
doesn't read taste data). Three options were mocked up; C (WYSIWYG mirror)
was rejected. This brief captures the decision on A vs B and the shape of
the target design.

## Decision
**Option B — one `/portal/profile` page with tabs.**

But refined: **3 tabs, not 4.** Membership isn't deep enough to stand on its
own — it folds into Overview.

```
/portal/profile
├── Overview    (default · the personal-looking landing)
├── Identity    (edit what others see)
└── Account     (name, email, sign out)
```

## Why B

- **Gut test passed** — "tabs feel safer." Containment beats sprawl.
- **Weekly use** — members drop in regularly but not daily. Tabs don't
  create friction at that cadence. If usage were daily-sticky, splitting
  into two routes would matter more.
- **Zero routing churn** — avatar still lands on `/portal/profile`. No
  mental model shift for existing members. Shipping safer.
- **A was conceptually cleanest but the cost of teaching members "two
  portal pages" didn't justify the gain for this frequency.**

## The three tabs

### Overview (default tab)
**Feel:** personal-looking landing. Identity-first, magazine-style. Not a
dashboard, not a control panel. "Quiet stats underneath" the hero.

**Must contain:**
- Hero card with skin + avatar + name + role + tags + member-since
- **Lootbox opener prominent** (non-negotiable — see below)
- Quiet stats strip (events · verified · rate · lootboxes)
- Membership tier pill + upgrade CTA (woven in, not its own section header)
- Event timeline
- AI/AM claim status if pending

### Identity
**Feel:** one surface for "what others see + controls." Unified editor.

**Must contain:**
- Socials (LinkedIn / X / GitHub / Website / Instagram)
- What I'm building · Why TAG (existing onboarding fields)
- Headline · Bio · Tags · Projects · Interests · Notable work · Influences
  · Key links (currently from `builder_profiles`)
- Visibility toggles for each AI-generated section (`show_*` flags)
- "View public profile ↗" link

**Critical constraint — invisible scaffolding:**
The AI pipeline is hidden plumbing. **No AI badges, no "regenerate"
buttons, no "sources we used" chips in the member UI.** Members just see
their profile and edit it. The pipeline runs in the background;
regeneration is admin-only. This is a simplification vs. the current
`/portal/taste` page, which proudly shows its AI nature.

### Account
**Feel:** utility. Small.

**Must contain:**
- Name editor
- Email (readonly)
- Sign out

## Non-negotiable
**Lootbox flow visibility.** Members must immediately see when they have
lootboxes waiting. Boxes cannot be buried behind a tab or scrolled below
the fold. This tensions slightly with the "personal-looking landing"
vibe, but reconciles by:
- Hero card + skin at top
- Lootbox status either as a loud CTA block directly under the hero, or
  a persistent pill/badge in the stats strip that stands out when count > 0
- If a member has unopened boxes, the Overview tab cannot look "done"

## What disappears

| Today | After |
|---|---|
| `/portal/taste` | Redirect to `/portal/profile?tab=identity` |
| `/builders/[slug]` | Redirect to `/profile/[slug]` |
| Taste "pending/researching" full-page states | Subtle banner or toast on Identity tab |
| "AI" badges, "regenerate", data-source chips | Gone from member UI (admin tools only) |

## What `/profile/[slug]` becomes (shared with A)

Unified public page reading `profiles` + `builder_profiles` respecting
`show_*` flags. Includes:
- Avatar/skin (if equipped)
- Name · role · member-since
- Socials
- Headline, bio, tags, projects, interests, notable work, links
  (honoring visibility flags)
- Events attended

`/builders/[slug]` becomes a 301 redirect here.

## Voice / feel notes

- "Personal-looking landing" — magazine cover, not control panel
- Stats should "whisper" — monospace labels, quiet values, only the
  lootbox count gets to shout
- Identity tab should feel like one page, not a stitched-together panel
- AI is how it gets built, not what members see

## Raw gold (user's own words)

> "it should be something else an overview"
> — the default tab shouldn't pick one of hero/stats/public/membership
> to dominate; it's a blend

> "A personal-looking landing"
> — magazine hero, skin-forward, stats whispered underneath

> "Invisible scaffolding"
> — AI pipeline is plumbing, not a feature members see

> "Tabs feel safer"
> — containment over sprawl; ship smaller

> "Lootbox flow visibility" (non-negotiable)
> — members must see boxes waiting without hunting

## Next steps

1. **Confirm this brief** — does anything above feel off?
2. **Design Overview tab composition** — specifically: where the lootbox
   CTA lives relative to the hero + stats. A mini-mockup of this tab
   would be worth building before code.
3. **Decide Identity tab structure** — single scrolling page with all
   fields, or sub-sections within the tab? (The current mockup shows a
   left-edit / right-visibility split.)
4. **Plan the taste pipeline UX for "not done yet" state** — since the
   UI becomes invisible scaffolding, what does a member see on their
   Identity tab while generation is running for the first time? Skeleton
   fields? A one-time banner? Silent population?
5. **Write the migration plan** — route redirects, data reads, delete
   orphaned code paths, tests.
