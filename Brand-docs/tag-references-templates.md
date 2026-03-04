# TAG References & Templates

**Date:** March 2026
**Purpose:** Curated examples, templates, and live sites to guide TAG's visual implementation

---

## Live Websites to Study

### Dark Brutalist / Street Energy (Closest to TAG)

| Site | URL | What to steal |
|---|---|---|
| **basement.studio** | basement.studio | Dark mode, grain texture, bold type, interactive 3D, developer collective energy | LIKE IT A LOT
| **Studio Freight** | studiofreight.com | Scroll-driven animations, brutalist grid, monospace type details | COOL BUT DIFFERENT
| **Linear** | linear.app | Dark UI done right, single accent color, clean typography hierarchy | I LIKE IT BUT IT IS TOO LITTLE SHOUTING!!!
| **Vercel** | vercel.com | Dark-first, gradient accents on black, crisp type, developer credibility | 
| **Nothing** | nothing.tech | Dot-matrix aesthetic, monochrome + one color, anti-corporate tech | LIKE IT!!
| **Poolsuite** | poolsuite.net | Retro-digital aesthetic, strong personality, audio culture crossover | THIS CREATIVITY IS GREAT, BUT DO NOT SEE IMMEDIATE FIT, COULD STEAL SOME CONCEPTS
| **Zora** | zora.co | Dark mode, minimal, cultural platform energy, creator-first | MEHHH

### Music / Culture Platforms (Tone References)

| Site | URL | What to steal |
|---|---|---|
| **Boiler Room** | boilerroom.tv | B&W + single accent, documentary photography, partners on your terms | I like but different
| **Resident Advisor** | ra.co | Charcoal-not-black, off-white-not-white, brutalist editorial layout | NOT SO MUCH
| **NTS Radio** | nts.live | Curated restraint, photography as the only color, dark mode | JUST A RADIO WEBSITE NOT FITTING
| **Soulection** | soulection.com | Community-as-brand, merchandise integration, global local chapters | MEHHHH

### Builder Communities (Structural References)

| Site | URL | What to steal |
|---|---|---|
| **Hack Club** | hackclub.com | Sticker culture, modular homepage, open design system, youth energy | not it!
| **Recurse Center** | recurse.com | Minimalist, content-first, "apply" CTA clarity, alumni showcase | NOT IT!!!!
| **South Park Commons** | southparkcommons.com | Clean membership site, event listing, community directory |
| **On Deck** | beondeck.com | Fellowship model, dark sections, community proof |
| **Indie Hackers** | indiehackers.com | Builder profiles, project showcases, revenue transparency |

### Membership / Club Sites (Exclusivity References)

| Site | URL | What to steal |
|---|---|---|
| **Soho House** | sohohouse.com | Curation as exclusivity, brand as container, warm photography |
| **Zero Bond** | zerobond.com | Minimal landing, "apply" gate, dark + gold accent |
| **Shelter Amsterdam** | shelter.amsterdam | Amsterdam venue, dark aesthetic, event-driven |
| **Paradiso Amsterdam** | paradiso.nl | Amsterdam cultural venue, event calendar UX, photography style |

### Hackathon / Event Platforms

| Site | URL | What to steal |
|---|---|---|
| **Next.js Conf** | nextjs.org/conf | Dark mode event page, speaker grid, schedule UX, countdown |
| **Devfolio** | devfolio.co | Hackathon platform, project submission flow, builder profiles |
| **ETHGlobal** | ethglobal.com | Dark mode, hackathon energy, project showcase grid |

### Indie Builder Sites (Build-in-Public Energy)

| Site | URL | What to steal |
|---|---|---|
| **Pieter Levels** | levels.io | Radical transparency, revenue dashboard, project list format |
| **ShipFast** | shipfa.st | Dark mode, orange accent, shipping culture, conversion-focused |
| **Marc Lou** | marclou.com | Build-in-public aesthetic, project showcase, indie energy |

---

## Templates & Starter Kits

### Next.js / React (Our Stack)

| Template | What it is | Relevance |
|---|---|---|
| **Neobrutalism Next.js Starter** | Brutalist UI components for Next.js | Thick borders, bold shadows, strong type — TAG's grid energy |
| **brutal-shadcn** | Neobrutalist variant of shadcn/ui | Drop-in replacement for our existing shadcn setup |
| **shadcn/ui dark themes** | Community dark theme presets | Starting point for TAG's warm-dark color system |
| **Taxonomy (shadcn)** | Full Next.js app with dashboard | Dark mode implementation, auth flow, content management |

### Design Systems to Reference

| System | URL | Why |
|---|---|---|
| **Radix Themes** | radix-ui.com/themes | Dark mode tokens, color scale architecture |
| **Geist (Vercel)** | vercel.com/geist | Developer-focused design system, dark-first |
| **Tailwind UI** | tailwindui.com | Dark mode component patterns, marketing sections |

### Framer / Webflow (Design Inspiration Only)

| Template | What to study |
|---|---|
| **Darkfolio** (Framer) | Portfolio dark mode, grain texture, scroll animations |
| **Brutalist Agency** (Webflow) | Grid system, thick borders, monospace details |
| **Noir** (Framer) | Dark landing page, single accent, typographic hierarchy |

---

## UI Patterns for TAG

### Hero Section
- **Linear approach**: Dark bg, large headline in bold weight, subtle gradient glow behind text
- **basement.studio approach**: Full-viewport dark canvas, 3D/interactive element, minimal text
- **Boiler Room approach**: Full-bleed photography, overlay text, no traditional hero structure
- **Recommended for TAG**: Large Syne 800 headline on `#141210`, subtle grain texture, Tag Orange accent on key word, scroll indicator

### Navigation
- **Linear**: Sticky, transparent-to-solid on scroll, minimal links
- **Nothing**: Fixed top bar, logo left, minimal links right, no hamburger on mobile
- **Recommended for TAG**: Sticky header, "TAG" wordmark left, 3-4 links right, dark bg, Tag Orange on hover

### Event/Program Cards
- **Boiler Room**: Large photo, minimal text overlay, date prominent
- **RA**: List format, date | venue | event name, minimal decoration
- **Recommended for TAG**: Dark cards (`#1e1c19`), Tag Orange date accent, Syne for event name, Space Grotesk for details

### Builder/Member Grid
- **Hack Club**: Sticker-style avatars, playful grid, random rotation
- **Recurse Center**: Clean grid, photo + name + "working on..." text
- **Recommended for TAG**: Grid of cards, photo (slightly desaturated), name in Space Grotesk, current project in Space Mono, Tag Orange "building" indicator

### CTA / Join Section
- **Zero Bond**: Minimal, "Apply for Membership" button, nothing else
- **Supreme**: Box logo, that's it
- **Recommended for TAG**: Dark section, "Tag in." headline in Syne, single input (email or "what are you building?"), Tag Orange submit button

---

## Grain / Texture Implementation

### CSS Approach (Recommended)
```css
.grain-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* inline SVG noise */
  opacity: 0.04;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

### SVG Filter Approach
```html
<svg>
  <filter id="grain">
    <feTurbulence baseFrequency="0.7" numOctaves="3" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
</svg>
```
Apply as `filter: url(#grain)` with low opacity (0.04-0.08).

### Where to Apply
- Hero section background
- Footer background
- Section dividers / ambient areas
- **Never** over text, buttons, or interactive elements

---

## Typography Specimen References

### Syne (Headlines)
- Google Fonts: fonts.google.com/specimen/Syne
- Variable weight 400-800, gets wider as it gets heavier
- Use at 800 weight for headlines, track slightly tight (-0.02em)
- Looks best at 48px+ on dark backgrounds

### Space Grotesk (Body/UI)
- Google Fonts: fonts.google.com/specimen/Space+Grotesk
- Descended from Space Mono (monospace), giving it character
- Use at 400-500 for body, 600-700 for UI labels
- Excellent readability at 16-18px

### Space Mono (Code/Data)
- Google Fonts: fonts.google.com/specimen/Space+Mono
- Shares DNA with Space Grotesk — visual family cohesion
- Use for: code snippets, data labels, timestamps, stats
- The monospace rhythm adds "builder" credibility

---

## Color Application Guide

### The Supreme Principle in Practice
Tag Orange (`#ff5f1f`) should appear in **maximum 3-5 spots** per screen:
1. Primary CTA button
2. One headline word or accent
3. Active/hover states
4. Navigation indicator
5. One data highlight

Everything else: the warm neutral system (`#141210` → `#f0ebe3` scale).

### Gradient Usage
- **Subtle glow**: `radial-gradient(ellipse at center, rgba(255,95,31,0.08), transparent 70%)` behind hero text
- **Card hover**: `linear-gradient(to bottom, rgba(255,95,31,0.05), transparent)` on card hover
- **Never**: Rainbow gradients, multi-color gradients, or gradient text

---

## Implementation Priority

### Phase 1: Foundation
1. Update CSS variables in `globals.css` with TAG color tokens
2. Load Syne, Space Grotesk, Space Mono via `next/font/google`
3. Update Tailwind config with TAG colors
4. Dark mode as default

### Phase 2: Landing Page
1. Hero section with grain texture
2. Navigation with TAG wordmark
3. Event/program section
4. Builder grid
5. CTA section

### Phase 3: Polish
1. Scroll animations (subtle, not overdone)
2. Photography treatment (desaturated, high contrast)
3. Responsive refinement
4. Light mode for partner/blog contexts
