-- ─── Space photos bucket + metadata table ─────────────────────
-- Operators upload photos of the space; displayed publicly on
-- /host-event so external event organisers can see what TAG
-- looks like.

insert into storage.buckets (id, name, public)
values ('space-photos', 'space-photos', true)
on conflict (id) do nothing;

-- Storage RLS: operators can upload/delete, service role for server-side
create policy "Operators can upload space photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'space-photos'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'operator'
    )
  );

create policy "Operators can delete space photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'space-photos'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'operator'
    )
  );

create policy "Service role full access on space-photos storage"
  on storage.objects for all
  using (
    bucket_id = 'space-photos'
    and auth.role() = 'service_role'
  );

-- Metadata table for captions + ordering
create table if not exists space_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  caption text,
  sort_order int not null default 999,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create index if not exists idx_space_photos_sort
  on space_photos (sort_order, created_at);

alter table space_photos enable row level security;

create policy "Public can read space photos"
  on space_photos for select
  using (true);

create policy "Operators can manage space photos"
  on space_photos for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'operator'
    )
  );

create policy "Service role full access on space_photos"
  on space_photos for all
  using (auth.role() = 'service_role');
