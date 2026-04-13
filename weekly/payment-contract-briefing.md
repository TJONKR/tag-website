# Payment & Contract Overhaul — Briefing

## Context
Refactor van de membership payment + contract flow. Twee paden toevoegen
(TAG onderhuur + AI AM claim), echte huurovereenkomst-PDF genereren in
plaats van generieke membership template, en een admin-approval flow voor
users die al een direct contract met AI AM hebben.

## Core Message
TAG positioneert zich als **onderverhuurder** tussen AI AM B.V. (hoofdverhuurder)
en members (onderhuurders). Nieuwe members via de site tekenen een TAG
onderhuur-contract en betalen via Stripe. Members die al een bestaand contract
bij AI AM hebben kunnen dat claimen via een knop; super admin (Tijs/Pieter)
bevestigt → Builder-status.

## Twee paden — beslissingsboom

**Pad A: Nieuwe member via site (Stripe)**
1. User kiest "Become Builder"
2. Vult contract-velden in (zie hieronder)
3. Kiest taal (NL of EN)
4. Tekent onderhuur-contract met TAG als verhuurder
5. Naar Stripe checkout (met optionele kortingscode voor live tests)
6. Webhook → Builder-role

**Pad B: Bestaande AI AM member claimt**
1. User kiest "I pay through AI/AM" knop
2. Verstuurt claim (geen extra info nodig — knop is genoeg)
3. Status: pending super-admin approval
4. Tijs of Pieter bevestigt in approval queue
5. User wordt Builder. **Geen nieuw contract, geen Stripe.**

## Contract — het onderhuur-contract (Pad A)

**Verhuurder (vast):** TAG, als onderverhuurder van AI AM B.V.
**Huurder (per member):**
- Bedrijfsnaam + KVK-nummer
- Vestigingsplaats
- Vertegenwoordiger (naam)

**Vast in contract:**
- Adres: Jacob Bontiusplaats 9-23, Amsterdam
- 1 flexible desk per member (voor nu — geen multi-desk logic)
- Prijs: **€150/maand excl. BTW** (→ €181,50 incl. 21%)
- Startdatum = tekendatum, maandelijks automatisch verlengd
- Opzegging schriftelijk voor de 15e
- Clausule 3.6-equivalent: als hoofdhuur AI AM ↔ TAG eindigt, mag TAG
  tussentijds beëindigen
- Template afgeleid van Notso-contract, maar TAG als (onder)verhuurder

**Taal:** Beide versies (NL + EN). User kiest bij tekenen, PDF in gekozen taal.

## AI/AM claim flow (Pad B)

**User-kant:** Enkel een knop "I pay through AI/AM" → bevestigingsscherm → done.

**Admin-kant:** Nieuwe role **"super admin"** — alleen Tijs + Pieter.
- Aparte approval queue, niet zichtbaar voor gewone Operators
- Eenmalig approven = Builder voor onbepaalde tijd
- Geen recurring check (geen maandelijkse bevestiging nodig)
- Super admin kan handmatig stopzetten als AI AM meldt dat huur niet meer betaald wordt

## Stripe

- **Blijft LIVE mode** tijdens development (geen test keys lokaal)
- Kortingscode / coupon toevoegen in Stripe dashboard voor live testing
  (waarschijnlijk `allow_promotion_codes: true` in checkout session)
- Huidige Stripe price €150 — verifiëren of die excl of incl BTW is ingericht
  (tax behavior in Stripe dashboard); mogelijk aanpassen naar €150 excl + 21% tax

## Data model impact

**Nieuwe role:** `super_admin` toevoegen aan user_role enum.
Tijs en Pieter krijgen deze role. Operators blijven bestaan voor applications.

**Subscriptions / payment tracking:**
- `stripe_subscription_id` moet nullable worden (AI/AM claims hebben geen Stripe sub)
- Nieuwe kolom `payment_method` (enum: `stripe` | `ai_am`)
- Nieuwe kolommen voor AI/AM approval: `approved_by`, `approved_at`, `approval_status`
- Of: aparte `ai_am_claims` tabel — te beslissen bij implementatie

**Contracts tabel uitbreiden:**
- `company_name`, `kvk`, `city`, `representative_name`, `language` (nl|en)
- Startdatum impliciet = signed_at

## Non-negotiables
- TAG = onderverhuurder, nooit hoofdverhuurder (juridisch precies)
- AI/AM claims gaan NIET door Stripe, NIET door contract-signing
- Alleen super admins (Tijs + Pieter) zien AI/AM approval queue
- €150 excl. BTW consistent overal (UI, contract, Stripe)

## Things to Avoid
- Niet maandelijks AI/AM herbevestigen — te veel admin overhead
- Niet AI/AM users ook laten tekenen — hun contract ligt bij AI AM
- Niet Stripe op test mode zetten zonder te vragen
- Niet aannemen dat bestaande Builders bestaan (nu nog niemand)

## Raw Gold — quotes uit interview
> "als het via ai am is geregeld dan hoeft er niets te gebeuren enkel dat wij bevestigen.
> als het een nieuw persoon is dan gaat betaling via ons en willen we een soortgelijk contract opstellen"

> "wat als wij als onderverhuurder fungeren. dus alle mensen zijn onderhuurder van ons"

> "alleen tijs en pieter, wij moeten eigenlijk super admin zijn"

> "laat live, ik wil een kortingscode om live te testen"

## Open items / te verifiëren tijdens implementatie
- Exacte juridische tekst voor TAG onderhuur-contract (afleiden van Notso,
  TAG partij maken, onderverhuur-clausule toevoegen) — mogelijk juridisch laten checken?
- Engelse vertaling van het NL contract (nieuw te schrijven)
- Stripe tax configuratie (excl BTW flow) — kan afwijken van huidige setup
- Naam van de super-admin pagina (bijv. `/portal/admin/claims`)
- Notificaties: email naar super admin bij nieuwe claim? email naar user bij approval?

## Next Steps
1. Dit briefing reviewen met Pieter
2. Juridische tekst TAG onderhuur-contract opstellen (NL + EN)
3. Implementation plan maken (data model migration, UI, API, tests)
4. Stripe coupon aanmaken voor live testing
5. Implementeren + testen via live coupon
