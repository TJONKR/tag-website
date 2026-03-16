-- User reference photos for skin generation (private)
create table if not exists user_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Index for fast lookup
create index if not exists idx_user_photos_user_id on user_photos(user_id);

-- RLS
alter table user_photos enable row level security;

create policy "Users can read own photos"
  on user_photos for select
  using (auth.uid() = user_id);

create policy "Users can insert own photos"
  on user_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own photos"
  on user_photos for delete
  using (auth.uid() = user_id);

create policy "Service role full access on user_photos"
  on user_photos for all
  using (auth.role() = 'service_role');

-- Private storage bucket for user reference photos
insert into storage.buckets (id, name, public)
values ('user-photos', 'user-photos', false)
on conflict (id) do nothing;
