-- Replace taste_evaluations with builder_profiles
-- Drops scoring columns, adds profile enrichment + visibility controls

drop table if exists taste_evaluations;

create table builder_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'researching', 'formatting', 'complete', 'error')),
  status_message text,
  error text,

  -- Research input (copied from profile at trigger time)
  input_name text,
  input_twitter text,
  input_linkedin text,
  input_github text,
  input_website text,
  input_building text,

  -- Enriched profile fields (AI-generated)
  headline text,
  bio text,
  tags text[],
  projects jsonb,
  interests text[],
  notable_work text[],
  influences text[],
  key_links jsonb,
  avatar_url text,
  data_sources text[],

  -- Visibility controls (user toggles)
  show_headline boolean not null default true,
  show_bio boolean not null default true,
  show_tags boolean not null default true,
  show_projects boolean not null default true,
  show_interests boolean not null default false,
  show_notable_work boolean not null default false,
  show_influences boolean not null default false,
  show_key_links boolean not null default true,

  created_at timestamptz not null default now(),
  completed_at timestamptz,

  constraint builder_profiles_user_id_unique unique (user_id)
);

alter table builder_profiles enable row level security;

create policy "Users can read own builder profile"
  on builder_profiles for select using (auth.uid() = user_id);

create policy "Users can update own visibility"
  on builder_profiles for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
