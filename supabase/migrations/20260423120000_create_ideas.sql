-- ─── Ideas (community idea box) ─────────────────────────────
create table if not exists ideas (
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

create index if not exists idx_ideas_user_id on ideas(user_id);
create index if not exists idx_ideas_status on ideas(status);
create index if not exists idx_ideas_created_at on ideas(created_at desc);

alter table ideas enable row level security;

-- Members can read their own ideas
create policy "Users can read own ideas"
  on ideas for select
  using (auth.uid() = user_id);

-- Super admins can read/manage everything
create policy "Super admins manage ideas"
  on ideas for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_super_admin = true
    )
  );

-- Members can insert their own ideas (status forced 'new')
create policy "Users can insert own ideas"
  on ideas for insert
  with check (
    auth.uid() = user_id
    and status = 'new'
    and admin_note is null
  );

-- Service role full access for server-side mutations
create policy "Service role full access on ideas"
  on ideas for all
  using (auth.role() = 'service_role');

-- Keep updated_at in sync on update
create or replace function set_ideas_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ideas_set_updated_at on ideas;
create trigger ideas_set_updated_at
  before update on ideas
  for each row execute function set_ideas_updated_at();
