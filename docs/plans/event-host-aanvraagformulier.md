# Plan — Aanvraagformulier externe event-hosts

_Status: ready to implement. Bron: meeting Daan 2026-04-27, `docs/Daan Amsterdam 27.md`._

## Scope

Mensen die NIET in de community zitten maar wel een event willen organiseren bij TAG dienen een aanvraag in via een publiek formulier. Admins reviewen en keuren goed / af.

## Naamgeving (voorkomt conflict met bestaande `applications` tabel)

- Tabel: `event_host_applications`
- Module: `lib/event-applications/`
- Publieke route: `/host-event`
- Admin route: `/portal/event-requests` (aparte pagina, niet onder `/portal/people`)

## Supabase migratie — `<timestamp>_create_event_host_applications.sql`

Velden:
- `id`, `name`, `email`, `phone?`, `organization?`
- `event_title`, `event_type` (enum: `talk | workshop | meetup | hackathon | launch | other`)
- `description` (min 30 chars), `expected_attendees?`
- `proposed_date?`, `proposed_date_flexible` (bool), `duration_hours?`
- `website_url?`, `social_url?`, `referral?`
- `status` (enum: `pending | approved | rejected | archived`, default `pending`)
- `admin_notes?`, `reviewed_at?`, `reviewed_by?` (fk auth.users)
- `created_at`, `ip_hash` (sha256 met pepper), `user_agent`

RLS:
- Anon insert: `with check (true)`
- Select/update: alleen operators (`profiles.role = 'operator'`) of service-role
- Indexen op `status`, `created_at desc`

## `lib/event-applications/` module

### `schema.ts`

Twee zod schemas:
- `eventHostRequestSchema` — publiek form + honeypot `website` veld (`.length(0)`) + `formLoadedAt` timestamp voor timing check
- `reviewEventApplicationSchema` — `status`, `adminNotes?`

### `mutations.ts`
- `insertEventHostApplication(data, meta: { ipHash, userAgent })` — insert + trigger mails (received + admin notify)
- `updateEventApplicationStatus(id, status, reviewedBy, adminNotes?)` — update + approval/rejection mail

### `queries.ts`
- `getEventHostApplications(status?)`, `getEventHostApplicationById(id)`, `getEventHostApplicationCounts()`

### `hooks.ts`
- `useEventHostApplications(status?)`, `useEventHostApplicationCounts()`

### `components/`
- `event-host-form.tsx` — publiek, patroon van `join-form.tsx`, inclusief hidden honeypot + timestamp
- `event-host-hero.tsx` — context copy
- `event-application-list.tsx` — admin table met status tabs
- `event-application-detail-dialog.tsx` — full view + review (approve/reject/archive + notes textarea)
- `index.ts`

## API routes

- `app/api/event-applications/request/route.ts` (publiek POST)
  - Zod parse → honeypot check (stille drop) → timing check (reject <3s) → IP hash + rate-limit → insert
  - Rate-limit: DB-based query op `ip_hash` + recent `created_at`; max 3/uur, 10/dag
- `app/api/event-applications/route.ts` (admin GET, ondersteunt `?status=` en `?counts=true`)
- `app/api/event-applications/[id]/route.ts` (admin PATCH)

## Spam / rate-limit (gelaagd, want repo heeft geen rate-limit infra)

1. **Honeypot** `website`-veld — stille 200 drop
2. **Minimum time-on-page** — hidden `formLoadedAt` timestamp, reject submits <3s
3. **DB-based IP-hash rate-limit** — sha256 met `APP_IP_HASH_SECRET` pepper, max 3/uur, 10/dag
4. **Cloudflare Turnstile** — env-gated flag (skip als `TURNSTILE_SECRET_KEY` leeg), aan te zetten als spam probleem wordt

## Email-flow — toevoegen aan `lib/email/senders.tsx`

- `sendEventHostRequestReceived` → bevestiging aanvrager
- `sendEventHostRequestNewAdmin` → admin notify, `replyTo: applicantEmail`, link naar `/portal/event-requests?id=<id>`
- `sendEventHostRequestApproved` → next-steps + admin notes
- `sendEventHostRequestRejected` → met adminNotes?

Templates in `lib/email/templates/` hergebruiken `_layout.tsx` + `_components.tsx`.

## Pages

### `app/host-event/page.tsx` (publiek)
Geen auth. `PageShell` + `EventHostHero` + `EventHostForm`. Success-state. Voeg CTA "Host an event at TAG" toe aan `app/events/page.tsx`.

### `app/portal/event-requests/page.tsx` (admin)
- `getUser()` → redirect `/portal` als geen operator
- SSR `getEventHostApplications()` + counts
- Rendert `EventApplicationList` met tabs (Pending / Approved / Rejected / Archived)
- Detail dialog met approve / reject / archive + notes textarea
- PATCH via SWR mutate

Nav-item "Event requests" voor operators in portal sidebar.

## Formuliervelden (UX)

**Required**: name, email, event title, event type, description (≥30 chars), expected attendees or note  
**Optional (achter "More details" disclosure)**: organization, phone, proposed date + flexible checkbox, duration, website, social URL, referral source

## Tests

### `tests/routes/event-applications-public.test.ts`
- 400 bij missing required
- 400 bij invalid email / URL / enum
- 400 bij te korte description
- 200 bij ingevuld honeypot (stille drop — geen DB row)
- 200 bij valide payload
- 429 bij >3 submits/uur zelfde IP
- 400 bij submit <3s na form load

### `tests/routes/event-applications-admin.test.ts`
- GET → 401 unauthenticated
- PATCH → 401 unauthenticated

### `tests/e2e/host-event-form.test.ts`
- Bezoek `/host-event`, vul form, zie success-state
- Required errors bij lege submit

### Email render-snapshots in `tests/routes/email.test.tsx`

## Implementatie-volgorde

1. Migratie `event_host_applications` + RLS + indexen
2. Module schema/types/queries/mutations (stub zonder mail)
3. Email templates + senders
4. Mail-calls inhaken in mutations
5. API routes (publieke request route met rate-limit)
6. Publieke form + `/host-event` pagina
7. Admin pagina + list/detail components + hooks
8. Portal nav-item voor operators
9. Tests
10. `pnpm typecheck && pnpm lint && pnpm test`
11. Env var `APP_IP_HASH_SECRET` (optioneel `TURNSTILE_*`) documenteren

## Open vragen / risico's

- Automatisch Luma draft bij approval? MVP: nee, admin doet handmatig
- Magic-link self-serve na approval? MVP: nee, alleen tekst in approval mail
- Foto's van de ruimte in `/host-event` sectie? Los traject — Tijs doet zelf
