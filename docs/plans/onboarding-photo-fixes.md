# Plan — Onboarding photo quick wins

_Status: ready to implement. Bron: meeting Daan 2026-04-27, `docs/Daan Amsterdam 27.md`._

## Fix 1: "Eerste foto wordt altijd getransformeerd"

De lootbox skin-generator pakt consistent de oudst-geüploade foto (`photos[0]` na `.order('created_at', { ascending: true })`). Daan's klacht: elke keer dezelfde eerste foto wordt getransformeerd.

### Call-sites
- `lib/lootbox/pipeline/run.ts` regels 30-44 — hot path die Daan ziet
- `app/api/avatar/generate/route.ts` regels 18-33 — dead endpoint (alleen tests), meenemen voor consistentie

### Fix
- Haal `.limit(1)` weg uit query in `run.ts`
- Vervang `photos[0]` door `photos[Math.floor(Math.random() * photos.length)]`
- Zelfde in `generate/route.ts`

### Subtiliteit
- `generate/route.ts` eist `photos.length < MAX_PHOTOS` → array nooit leeg
- Lootbox valideert `if (!photos?.length)` → blijft werken
- Open vraag (niet quick win): Daan zei "eigenlijk wordt hier niks meer gedaan zeker" — transform pipeline misschien helemaal overbodig? Los traject.

## Fix 2: "Klik op foto in community vergroot lelijk"

Zit in `lib/people/components/member-list.tsx` (enige plek met enlarged/lightbox patroon).

### Relevante code
- regel 83: `const [enlargedAvatar, setEnlargedAvatar] = useState<Member | null>(null)`
- regels 259-275: `<button>` rond `<Avatar>` met `onClick` + `hover:opacity-80 cursor-pointer`
- regels 302-320: `<Dialog open={!!enlargedAvatar}>` met vergrote avatar in cirkel
- regel 3: `Image` import (alleen in dat dialog gebruikt)

### Fix
1. Verwijder `enlargedAvatar` state (regel 83)
2. Vervang `<button>` wrapper (regels 259-275) door gewone `<div className="mb-3 shrink-0">` → klik bubbelt naar card (profile navigate / operator dialog), gedrag blijft werken
3. Verwijder `<Dialog open={!!enlargedAvatar}>` blok (regels 302-320)
4. Verwijder `Image` import (regel 3)

**Niet aanraken**: tweede `<Dialog>` op regel 324+ (operator-acties).

### Keyboard/a11y
Button wordt vervangen door div — card zelf is al klikbare div (bestaande tech debt, niet in scope).

## Regressietests

- Quick wins — per CLAUDE.md skip bij simpele UI fixes, maar:
- Handmatige QA via `/browse` of dev server: klik avatar op `/portal/people` → verwacht navigatie of operator-dialog, géén lightbox

## Files to touch

- `lib/lootbox/pipeline/run.ts`
- `app/api/avatar/generate/route.ts`
- `lib/people/components/member-list.tsx`
