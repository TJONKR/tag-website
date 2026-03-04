# TAG Visual Direction

**Date:** March 2026
**Status:** Research complete, ready for implementation

## Where TAG Sits

```
POLISHED / QUIET                                      RAW / LOUD
     |                                                     |
   F.inc --- Soho House --- SPC --- On Deck --- Frontier Tower
  (gallery)  (members club) (salon)  (camp)    (warehouse)
                                                        ↗
                                                      TAG
                                              (underground but crafted)
```

TAG occupies a space none of these brands currently fill: credible ambition expressed through underground cultural codes. Every builder community communicates seriousness through polish and restraint. TAG communicates seriousness through intensity and rawness — which, in Amsterdam's context (street art, electronic music, squat culture, Dutch design heritage), has deep cultural legitimacy.

---

## Typography

### Primary Pairing: "The Street-Tech Hybrid"

| Role | Font | Weight | Why |
|---|---|---|---|
| Headlines | **Syne** | 800 | Gets wider AND heavier — feels physical, like something sprayed on a wall |
| Body/UI | **Space Grotesk** | 400-500 | Retro-future voice, readable, has character. Descended from a monospace font |
| Code/data/labels | **Space Mono** | 400 | Shares DNA with Space Grotesk, creates family cohesion |

All three are free Google Fonts. The tension between Syne (muscular, expressive) and Space Grotesk/Mono (precise, nerdy) IS the TAG brand.

### Alternative Pairings

**Pairing B: "The Refined Underground"**
- Headlines: Bricolage Grotesque 700-800 (variable width + optical size axes)
- Body: Bricolage Grotesque 400 (same font, completely different feel at small sizes)
- Code: IBM Plex Mono 300-400

**Pairing C: "The Builder's Stack"**
- Headlines: Space Grotesk 700
- Body: Space Grotesk 400
- Code: Geist Mono or JetBrains Mono

### What to Avoid
- **Bebas Neue** — the "default graffiti brand font," overused
- **Instrument Serif** — too editorial, pushes TAG away from street energy
- Generic sans-serifs (Inter, Helvetica) — no personality, no tension

---

## Color Palette

### Primary: "Amsterdam Street" — Monochrome + One Hit

| Role | Name | Hex | Usage |
|---|---|---|---|
| Background (dark) | Midnight Brick | `#141210` | Warm black, not blue-black. Amsterdam at 2am. |
| Background (light) | Canal Stone | `#f2ede5` | Warm parchment for partner contexts |
| Foreground (dark) | Chalk | `#f0ebe3` | Text on dark, slightly warm |
| Foreground (light) | Ink | `#1a1816` | Text on light |
| **Primary accent** | **Tag Orange** | `#ff5f1f` | Spray-can-meets-Dutch-Orange. CTAs, highlights, active states |
| Secondary accent | Signal Blue | `#2b5cff` | Links, code highlights, tech credibility. Use sparingly |
| Tertiary accent | Amber Glow | `#ffb347` | Badges, achievements, celebration moments |

### Neutral System

| Role | Dark Mode | Light Mode |
|---|---|---|
| Surface elevated | `#1e1c19` | `#ffffff` |
| Surface | `#141210` | `#f2ede5` |
| Surface depressed | `#0e0d0b` | `#e8e3db` |
| Border subtle | `#2a2724` | `#d6d0c6` |
| Border strong | `#3d3a35` | `#b8b0a4` |
| Text primary | `#eae5db` | `#1a1816` |
| Text secondary | `#9b9589` | `#6b6560` |
| Text muted | `#5e5850` | `#9b9589` |

### Why Tag Orange (#ff5f1f)
- Distinct from HN orange (#ff6600), Reddit (#ff4500), SoundCloud (#ff5500)
- Hotter, more street version of Dutch Orange (#FF9B00)
- Spray-paint energy, high visibility on dark backgrounds
- One accent color used with discipline > a rainbow (Supreme principle)

### Minimal Version
If the full palette feels like too much:
- Background: `#0f0e0c` (warm black)
- Foreground: `#f0ebe3` (warm white)
- THE accent: `#ff5f1f` (Tag Orange — the only color)
- Mid: `#6b6560` (secondary text)

---

## Texture & Grain

### Approach
- **Selective, not global** — apply to hero sections and ambient surfaces only, not the entire page
- **SVG noise filter** — `baseFrequency: 0.7-0.9`, `numOctaves: 3-4`, `opacity: 0.04-0.08`
- **Warm-tinted grain** — subtle radial gradient of `rgba(255, 95, 31, 0.03)` under the noise
- **Static, not animated** — animated grain is overdone in 2026
- **Never over UI controls or text** — grain is atmosphere, not wallpaper

### What Good Grain Signals
Analog, physical, human-made. An antidote to AI-generated polish. Concrete texture, not Instagram filter.

---

## Dark Mode vs Light Mode

### Dark-First Hybrid

| Context | Mode |
|---|---|
| Landing page | Dark only (brand statement) |
| Event pages | Dark only (matches physical event energy) |
| Community dashboard | Dark default, toggle available |
| Newsletter / blog | Light default, toggle available |
| Partner materials | Light (institutional credibility) |

The graffiti metaphor only works on dark surfaces — spray paint on concrete, not on printer paper.

---

## Design Principles

### 1. "Official Anarchy" (Dutch design tradition)
Rigorous structure that enables creative freedom. The grid is systematic, the type hierarchy is clear — but within that system, there's room for the unexpected. This is how you stay anti-corporate but partner-ready.

### 2. Supreme Principle
Radical restraint signals confidence. Don't over-explain, don't beg to join. "If you know, you know."

### 3. Boiler Room Principle
A strong enough visual identity forces partners to come to you on your terms. The sponsors adapt to you, not the other way around.

### 4. Frontier Tower Principle
Embrace the unfinished. A brand that feels alive, co-created, evolving — not polished and final.

### 5. Container, Not Billboard (Soho House)
The identity should hold many different people and energies. The specific texture (grit, grain, rawness) sets the tone without prescribing the content.

---

## Photography Style

Documentary approach adapted for tech culture:
- Late-night coding sessions, whiteboard chaos, demo day energy, hackathon 2am vibes
- Not staged diversity photos. Not stock handshakes.
- Real people, real work, real spaces
- Slightly grainy, slightly dark, always candid
- Flash photography aesthetic from club culture (Boiler Room)
- Desaturated, high-contrast treatment

---

## Reference Brands

| Brand | What to steal | What to avoid |
|---|---|---|
| **Boiler Room** | B&W + single accent, documentary photo, partners on your terms | Don't replicate nightlife aesthetic |
| **Resident Advisor** | Charcoal-not-black, off-white-not-white, brutalist editorial | Too much content density |
| **NTS Radio** | Curated restraint, photography as the only color | Too passive for TAG's energy |
| **Supreme** | Radical simplicity, anti-UX-as-identity | TAG needs more content |
| **F.inc** | Let typography carry the brand, quiet confidence | Too polished/gallery-like |
| **Hack Club** | Sticker culture, modular homepage, open design system | Too young/educational in tone |
| **Frontier Tower** | DIY ethos, co-created feel, raw energy | Digital presence is underdeveloped |
| **Soho House** | Curation as exclusivity, brand as container | Luxury warmth is wrong register |

---

## Implementation Notes

### CSS Variables Setup
The existing `globals.css` uses shadcn's HSL-based CSS variable system. The TAG palette should be integrated into this system, replacing the default shadcn grays with the warm neutral system above.

### Font Loading
All three recommended fonts (Syne, Space Grotesk, Space Mono) are available via `next/font/google` for optimal loading in the Next.js stack.

### Tailwind Integration
Extend `tailwind.config.ts` with TAG's color tokens:
- `tag-orange` for `#ff5f1f`
- `tag-blue` for `#2b5cff`
- `tag-amber` for `#ffb347`
- Warm neutral scale replacing default grays
