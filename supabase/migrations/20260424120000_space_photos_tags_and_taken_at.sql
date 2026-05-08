-- ─── Space photos: taken_at + member tagging ──────────────────────
-- Safe to re-run: uses IF NOT EXISTS and drop-then-create for policies.
-- Can be pasted directly into the Supabase SQL editor.

alter table space_photos
  add column if not exists taken_at timestamptz;

-- Backfill: for existing rows, use created_at so the UI has a date.
-- EXIF fills this on fresh uploads going forward.
update space_photos
   set taken_at = created_at
 where taken_at is null;

-- Tags table ─────────────────────────────────────────────────────
create table if not exists space_photo_tags (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references space_photos(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  tagged_by uuid references profiles(id) on delete set null,
  tagged_at timestamptz not null default now(),
  unique (photo_id, user_id)
);

create index if not exists idx_space_photo_tags_photo on space_photo_tags (photo_id);
create index if not exists idx_space_photo_tags_user on space_photo_tags (user_id);

alter table space_photo_tags enable row level security;

-- Reads: anyone (same surface visibility as photos).
drop policy if exists "Public can read space photo tags" on space_photo_tags;
create policy "Public can read space photo tags"
  on space_photo_tags for select
  using (true);

-- Authenticated members can tag anyone.
drop policy if exists "Authenticated can tag" on space_photo_tags;
create policy "Authenticated can tag"
  on space_photo_tags for insert
  to authenticated
  with check (tagged_by = auth.uid());

-- Anyone authenticated can remove any tag (explicit product decision:
-- both the tagged member and other members may clean up tags).
drop policy if exists "Authenticated can untag" on space_photo_tags;
create policy "Authenticated can untag"
  on space_photo_tags for delete
  to authenticated
  using (true);

drop policy if exists "Service role full access on space_photo_tags" on space_photo_tags;
create policy "Service role full access on space_photo_tags"
  on space_photo_tags for all
  using (auth.role() = 'service_role');
