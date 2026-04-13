create table if not exists contact_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default 'building',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Seed with existing hardcoded data
insert into contact_items (title, description, icon, sort_order) values
  ('Address', 'Jacob Bontiusplaats 9, 1018 LL Amsterdam', 'mappin', 0),
  ('Communication', 'We use WhatsApp for general communication. You''ll be added to the group when you join.', 'hash', 1);
