# Prompt: Builder Profile Ingestion Flow (LinkedIn → Website)

## Goal
Build an end-to-end flow to add new builders to the TAG website by scraping their LinkedIn profile, processing their headshot with our signature dark B&W + orange filter, and inserting them into the site.

## Context
- Project: TAG — To Achieve Greatness (Next.js 15 / React 19 / TypeScript / pnpm)
- Builder data lives in `lib/builders/data.ts` — currently a hardcoded array of `Builder` objects
- Builder cards display on the landing page as a photo grid with a dark desaturated + orange tint overlay (CSS-based, applied at render time)
- Headshots are stored in `public/images/builders/` as JPGs
- Each builder has: `name`, `slug`, `role`, `initials`, `active`, `image` (path), `gradientFrom`, `gradientTo`
- Profile pages exist at `/builders/[slug]` with `generateStaticParams`

## What to Build

### 1. LinkedIn Profile Scraper
- Input: a LinkedIn profile URL
- Extract: full name, headline/role, profile photo URL
- Consider using Puppeteer, Playwright, or a LinkedIn API/proxy service (e.g. Proxycurl, RapidAPI LinkedIn scraper)
- Handle rate limiting and auth gracefully
- Output structured data matching our `Builder` interface

### 2. Headshot Processing Pipeline
- Download the LinkedIn profile photo at highest available resolution
- Apply image filter programmatically (Sharp or similar):
  - Desaturate to grayscale
  - Darken significantly (levels/curves adjustment)
  - Apply orange color tint overlay (multiply blend, #ff5f1f at ~40% opacity)
- Save processed image to `public/images/builders/{slug}.jpg`
- This bakes the filter into the actual image file (the CSS overlay on the site adds additional depth on top)

### 3. Builder Data Insertion
- Generate `slug` from name (lowercase, hyphenated)
- Generate `initials` from first + last name
- Auto-assign a gradient pair from the existing palette (cycling)
- Add the new builder to `lib/builders/data.ts`
- Options to explore:
  - CLI script: `pnpm add-builder <linkedin-url>` that does everything
  - Admin UI: simple form page at `/admin/builders/add`
  - Or move builder data to Supabase so it's dynamic (the project already uses Supabase)

### 4. Profile Page Auto-Generation
- Since we use `generateStaticParams`, new builders automatically get a profile page after rebuild
- If we move to Supabase, switch to dynamic rendering or ISR

## Technical Decisions to Make
- **Data storage**: Keep hardcoded in `data.ts` vs move to Supabase?
- **Image processing**: Build-time (Sharp script) vs upload-time (API route with Sharp)?
- **LinkedIn scraping**: Self-hosted (Playwright) vs third-party API (Proxycurl)?
- **Trigger**: CLI command vs admin UI vs both?
- **Filter approach**: Bake into image file, keep as CSS overlay, or both?

## Files to Reference
- `lib/builders/data.ts` — current builder data model and helpers
- `components/landing/builder-card.tsx` — card component with current CSS filter layers
- `components/landing/builders.tsx` — landing page grid section
- `app/builders/[slug]/page.tsx` — profile page template

## Stretch Goals
- Edit existing builder profiles (update role, swap photo, toggle active)
- Bulk import from a list of LinkedIn URLs
- Auto-crop/resize headshots to consistent dimensions
- Preview the processed headshot before confirming
