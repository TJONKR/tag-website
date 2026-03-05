create table applications (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  building text not null,
  why_tag text not null,
  referral text,
  created_at timestamptz default now()
);

alter table applications enable row level security;

create policy "Allow public inserts"
  on applications for insert
  to anon
  with check (true);
