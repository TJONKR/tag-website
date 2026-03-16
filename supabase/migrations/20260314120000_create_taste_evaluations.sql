-- Taste evaluations: one-time AI taste evaluation per user
create table if not exists taste_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'deep-research', 'analyzing', 'writing-report', 'complete', 'error')),
  status_message text,
  error text,

  -- Input fields (copied from profile at trigger time)
  name text,
  twitter_url text,
  linkedin_url text,
  github_url text,
  website_url text,
  building text,

  -- Result fields (populated on completion)
  score numeric(5,2),
  title text,
  verdict text,
  level_profile text,
  overall_level text,
  dimensions jsonb,
  taste_dna text,
  cross_platform_consistency text,
  recommendations jsonb,
  data_sources jsonb,
  avatar_url text,
  screenshots jsonb,

  created_at timestamptz not null default now(),
  completed_at timestamptz,

  constraint taste_evaluations_user_id_unique unique (user_id)
);

-- RLS
alter table taste_evaluations enable row level security;

-- Users can read their own evaluation
create policy "Users can read own taste evaluation"
  on taste_evaluations for select
  using (auth.uid() = user_id);

-- Service role has full access (handled by default when using service role client)
