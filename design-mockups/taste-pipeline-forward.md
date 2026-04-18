# Forward-looking taste pipeline · plan (not implemented)

**Status:** proposal, no code yet. Flagged during dogfooding on 2026-04-18.

## The problem in plain words

The current taste pipeline researches a member's entire public history and
surfaces whatever it finds. That produces a profile that reads like a
LinkedIn summary going back 4+ years — often dominated by older phases of
a person's work that they no longer identify with.

Concrete example from the dogfood session:

> "Founder & AI automation builder democratizing voice-first development"
> tags: AI · Automation · **No-Code** · Voice Computing · Vibe Coding · Founder · Community Building
> projects include: lecturing at Beeckestijn Business School

> "I don't really lecture at Beeckestijn anymore, I don't identify with
> that organization. No-code and automation is stuff from way back."

The profile is accurate as *history* but misrepresents the person as
*they are today* — and more importantly, **doesn't express where they're
going.**

## The shift

Recenter the pipeline around two axes:

1. **Recency bias** — who are you *right now*? Roughly last 12 months of
   public output, with earlier material only used if it's still the
   thing you're known for today.
2. **Forward-looking dimension** — where are you going? What are you
   betting on next? This is **not** in the profile today at all.

Together: a profile that reads as a *current snapshot with a vector* —
not a career summary.

## Proposed schema additions

Two possible new columns on `builder_profiles`:

```
current_focus  text   -- what you're doing right now (1-3 sentences)
trajectory     text   -- where you're heading (1-3 sentences)
```

Or one combined field `now_and_next` if the distinction feels forced.

The existing `bio` stays, but gets constrained to *present-tense and
recent* instead of biographical. Older accomplishments that matter can
collapse into `notable_work` (which is already a list).

## Pipeline prompt changes

Changes to the research + formatter prompts in `lib/taste/pipeline/`:

1. **Research stage** — instruct the agent to explicitly prefer sources
   dated in the last 12 months. When citing older material, require a
   reason ("this is still the thing they're known for today"). Down-weight
   bios, about pages, and first-result summaries that recycle old copy.
2. **Formatter stage** — rewrite the bio prompt from "summarize who this
   person is" to "describe this person as they are *now*, in present
   tense, focused on the last year." Add two new output fields:
   `current_focus` (what are they doing now) and `trajectory` (where are
   they going).
3. **Tags** — cap at top ~5, require "still-relevant" filtering. Today
   tags sprawl into 7-8 items that include historical phases.

## UI surface

Two new cards in the Identity tab, slotted between Bio and Projects:

- **Now** (from `current_focus`) — present-tense, what am I focused on
- **Next** (from `trajectory`) — where I'm heading, what I'm betting on

On the public profile, these sit directly under the headline — the first
thing someone reads about you after your name.

## Migration plan

1. Add columns via migration (nullable, no default — existing profiles
   just won't have them until regeneration).
2. Update pipeline prompts + formatter output schema.
3. Add `show_current_focus` / `show_trajectory` visibility flags.
4. Add Edit dialogs (simple text, like bio).
5. Bulk regenerate for all active members (super-admin action, reuses
   existing `POST /api/taste/evaluate`).

## Open questions (to decide before implementation)

1. **One field or two?** "Now" and "Next" might be hard for AI to split
   cleanly. One merged field (`now_and_next`) could read more naturally
   but loses the symbolic clarity of a two-card present-vs-future view.
2. **Hard recency window or soft?** 12 months as instruction vs. hard
   filter on source dates (harder — needs date extraction per source).
3. **Does bio survive as a field, or does "Now + Next" replace it?**
   Bio is useful for third-person context; "Now/Next" is first-person
   forward-looking. They might coexist, or bio might become redundant.
4. **Forward-looking content is fragile** — a "trajectory" statement
   from 6 months ago can age badly. Prompt to encourage humility + an
   explicit "last updated" timestamp per field might help.

## Rough sizing

- Schema migration: 30 min
- Prompt + formatter changes: 2-4 hours (real testing required)
- UI cards + edit dialogs: 1 hour
- Visibility flag work: 30 min
- Bulk regen + validation: 1 hour

Plan-first, test with 3-5 real members (including Tijs) before rolling
out widely. The prompt work is the unknown — output quality has to beat
"accurate but stale" or the effort is wasted.

## Why this is a followup, not a blocker

Editability (which we just shipped) gives members a manual override for
any of these issues today. The forward-looking pipeline is about
*default quality* — first-generation output should read right without
edits. Ship when the manual-edit frequency data says it's worth the
pipeline cost.
