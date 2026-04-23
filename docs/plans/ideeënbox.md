# Plan — Ideeënbox

_Status: ready to implement. Bron: meeting Daan 2026-04-27, `docs/Daan Amsterdam 27.md`._

## Scope

MVP: ingelogde member post idee (titel + body + categorie), ziet eigen lijst. Super-admin ziet alles, kan status + interne notitie aanpassen.

**Expliciet NIET in MVP**: upvotes, comments, e-mail notificaties, anoniem posten, tags/labels, edit-history, bijlages.

## Supabase migratie — `supabase/migrations/<timestamp>_create_ideas.sql`

```sql
create table ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 4000),
  category text not null check (category in ('event', 'feature', 'community', 'other')),
  status text not null default 'new'
    check (status in ('new', 'in_review', 'planned', 'done', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ideas_user_id on ideas(user_id);
create index idx_ideas_status on ideas(status);
create index idx_ideas_created_at on ideas(created_at desc);

alter table ideas enable row level security;

create policy "Users can read own ideas"
  on ideas for select using (auth.uid() = user_id);

create policy "Authenticated can read all ideas"
  on ideas for select using (auth.role() = 'authenticated');

create policy "Users can insert own ideas"
  on ideas for insert with check (
    auth.uid() = user_id
    and status = 'new'
    and admin_note is null
  );

create policy "Super admins manage ideas"
  on ideas for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_super_admin = true)
  );

create policy "Service role full access on ideas"
  on ideas for all using (auth.role() = 'service_role');

create or replace function set_ideas_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger ideas_set_updated_at
  before update on ideas for each row execute function set_ideas_updated_at();
```

## `lib/ideas/` module

### `types.ts`
```ts
export type IdeaCategory = 'event' | 'feature' | 'community' | 'other'
export type IdeaStatus = 'new' | 'in_review' | 'planned' | 'done' | 'rejected'

export interface Idea {
  id: string
  user_id: string
  title: string
  body: string
  category: IdeaCategory
  status: IdeaStatus
  admin_note: string | null
  created_at: string
  updated_at: string
}

export interface IdeaWithAuthor extends Idea {
  author: { id: string; name: string | null; avatar_url: string | null }
}
```

### `schema.ts`
```ts
import { z } from 'zod'

export const ideaCategoryEnum = z.enum(['event', 'feature', 'community', 'other'])
export const ideaStatusEnum = z.enum(['new', 'in_review', 'planned', 'done', 'rejected'])

export const createIdeaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(4000),
  category: ideaCategoryEnum,
})
export type CreateIdeaInput = z.infer<typeof createIdeaSchema>

export const updateIdeaStatusSchema = z.object({
  status: ideaStatusEnum,
  admin_note: z.string().max(2000).optional().nullable(),
})
export type UpdateIdeaStatusInput = z.infer<typeof updateIdeaStatusSchema>
```

### `queries.ts`
- `getIdeasByUser(userId)` — eigen ideas, newest first
- `getAllIdeas(statusFilter?)` — super-admin only; joined met `profiles` (name, avatar_url); service-role
- `getIdeaById(id)` — via RLS

### `mutations.ts`
- `createIdea(userId, input)` — status forced 'new', admin_note null
- `updateIdeaStatus(id, { status, admin_note })` — service-role, super-admin only
- `deleteIdea(id)` — optioneel

### `hooks.ts`
- `useMyIdeas()` → `/api/ideas/mine`
- `useAdminIdeas(status?)` → `/api/admin/ideas?status=...`

### `components/`
- `idea-form.tsx` — shadcn Form + Input + Textarea + Select
- `idea-list.tsx` — lijst met status-badges
- `admin-idea-table.tsx` — Table + filter + Dialog voor status change
- `status-badge.tsx`
- `index.ts` — re-exports

## API routes

- `app/api/ideas/route.ts` — POST (auth + createIdea)
- `app/api/ideas/mine/route.ts` — GET (auth + getIdeasByUser)
- `app/api/admin/ideas/route.ts` — GET (auth + super-admin + getAllIdeas)
- `app/api/admin/ideas/[id]/route.ts` — PATCH (auth + super-admin + updateIdeaStatus)

Error shape: `{ errors: [{ message }] }`.

## Pages

- `app/portal/ideas/page.tsx` — server component, `getUser()`, SSR `getIdeasByUser`, rendert form + lijst
- `app/portal/admin/ideas/page.tsx` — server component, guard `if (!user.is_super_admin) redirect('/portal')`, SSR `getAllIdeas`, rendert admin table

## Navigatie — `lib/portal/data.ts`

Voeg toe aan `portalNavGroups[0].items`:
```ts
{ label: 'Ideas', href: '/portal/ideas', icon: 'lightbulb' }
```

En `lightbulb: Lightbulb` toevoegen aan `iconMap` in `lib/portal/components/portal-sidebar.tsx`.

Admin-ingang: subtiele link op `/portal/ideas` voor super-admins (liever dan sidebar-vervuiling).

## Tests (verplicht per CLAUDE.md)

### `tests/routes/ideas.test.ts`
- `POST /api/ideas` → 401 unauthenticated
- `GET /api/ideas/mine` → 401 unauthenticated
- `GET /api/admin/ideas` → 403 non-admin
- `PATCH /api/admin/ideas/[id]` → 403 non-admin

### `tests/e2e/ideas.test.ts` (optioneel)
- Happy path: login als member → `/portal/ideas` → form → submit → idea in eigen lijst

## Implementatie-volgorde

1. Migratie schrijven + lokaal draaien
2. `lib/ideas/types.ts` + `schema.ts`
3. `lib/ideas/queries.ts` + `mutations.ts`
4. API routes
5. Route tests
6. `lib/ideas/hooks.ts` + components
7. Pages
8. Sidebar nav + icon
9. `pnpm typecheck && pnpm lint && pnpm test:routes`

## Valkuilen

- **RLS insert-policy**: test expliciet dat member kan inserten (eerder brak een claims-migratie hierop)
- **Onboarding-gate middleware**: `/portal/*` redirect niet-geonboarde users — e2e tests moeten daar rekening mee houden
- **`is_super_admin` check** in zowel page als API route
- **Category enum uitbreiden**: Zod enum + DB check-constraint in sync houden
