-- Avatar generation jobs table
-- Run this in Supabase SQL editor

create table if not exists avatar_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  status text not null default 'generating',
  image_url text,
  prompt text not null,
  created_at timestamptz default now()
);

-- Index for fast lookups by user
create index if not exists idx_avatar_jobs_user_id on avatar_jobs(user_id);

-- RLS policies
alter table avatar_jobs enable row level security;

create policy "Users can view their own avatar jobs"
  on avatar_jobs for select
  using (auth.uid() = user_id);

create policy "Service role can manage avatar jobs"
  on avatar_jobs for all
  using (true)
  with check (true);
