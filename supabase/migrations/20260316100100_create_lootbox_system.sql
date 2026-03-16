-- ─── Lootbox Events ─────────────────────────────────────────────
create table if not exists lootbox_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table lootbox_events enable row level security;

create policy "Anyone can read active lootbox events"
  on lootbox_events for select
  using (active = true);

create policy "Service role full access on lootbox_events"
  on lootbox_events for all
  using (auth.role() = 'service_role');

-- ─── Lootbox Styles (cards within an event) ─────────────────────
create table if not exists lootbox_styles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references lootbox_events(id) on delete cascade,
  name text not null,
  prompt text not null,
  preview_url text,
  rarity text not null default 'common',
  generation_type text not null default '2d',
  weight int not null default 100,
  created_at timestamptz not null default now(),
  constraint lootbox_styles_rarity_check check (rarity in ('common', 'rare')),
  constraint lootbox_styles_generation_type_check check (generation_type in ('2d', '3d'))
);

create index if not exists idx_lootbox_styles_event_id on lootbox_styles(event_id);

alter table lootbox_styles enable row level security;

create policy "Anyone can read lootbox styles"
  on lootbox_styles for select
  using (true);

create policy "Service role full access on lootbox_styles"
  on lootbox_styles for all
  using (auth.role() = 'service_role');

-- ─── User Skins (collected skins) ──────────────────────────────
create table if not exists user_skins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  style_id uuid references lootbox_styles(id),
  image_url text,
  model_3d_url text,
  rarity text not null default 'common',
  status text not null default 'generating',
  equipped boolean not null default false,
  created_at timestamptz not null default now(),
  constraint user_skins_rarity_check check (rarity in ('common', 'rare')),
  constraint user_skins_status_check check (status in ('generating', 'complete', 'error'))
);

create index if not exists idx_user_skins_user_id on user_skins(user_id);

alter table user_skins enable row level security;

create policy "Users can read own skins"
  on user_skins for select
  using (auth.uid() = user_id);

create policy "Service role full access on user_skins"
  on user_skins for all
  using (auth.role() = 'service_role');

-- ─── User Lootboxes ────────────────────────────────────────────
create table if not exists user_lootboxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references lootbox_events(id),
  status text not null default 'available',
  cards jsonb,
  chosen_style_id uuid references lootbox_styles(id),
  skin_id uuid references user_skins(id),
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  constraint user_lootboxes_status_check check (status in ('available', 'opened'))
);

create index if not exists idx_user_lootboxes_user_id on user_lootboxes(user_id);

alter table user_lootboxes enable row level security;

create policy "Users can read own lootboxes"
  on user_lootboxes for select
  using (auth.uid() = user_id);

create policy "Service role full access on user_lootboxes"
  on user_lootboxes for all
  using (auth.role() = 'service_role');

-- ─── Seed: OG Day One Event ────────────────────────────────────
insert into lootbox_events (name, slug, description, active)
values (
  'OG Day One',
  'og-day-one',
  'The original lootbox for early TAG members. Four unique styles to define your builder identity.',
  true
)
on conflict (slug) do nothing;

-- Insert styles for OG Day One
do $$
declare
  v_event_id uuid;
begin
  select id into v_event_id from lootbox_events where slug = 'og-day-one';

  insert into lootbox_styles (event_id, name, prompt, rarity, generation_type, weight)
  values
    (
      v_event_id,
      'Illustration',
      'Transform this portrait into a stylized digital illustration. Clean vector-art style with bold flat colors, subtle cel-shading, and minimal detail. Use a limited palette of deep black, charcoal gray, and warm orange (#ff5f1f) as the accent color. Dark background. The person should be clearly recognizable but feel like a premium tech company avatar illustration. Think Notion-style team illustrations but edgier and more high-contrast.',
      'common',
      '2d',
      100
    ),
    (
      v_event_id,
      'Comic Book',
      'Transform this photo into a bold graphic novel / comic book style portrait. Heavy black ink outlines, dramatic shadows, high contrast cel-shading. Limited color palette: mostly black and dark charcoal with vivid orange (#ff5f1f) as the only accent color for highlights and rim lighting. Dark moody background. Keep the person''s likeness and features recognizable. The style should feel like a page from a premium graphic novel — Sin City meets modern tech branding. Do not add any text or watermarks.',
      'common',
      '2d',
      100
    ),
    (
      v_event_id,
      'Screenprint',
      'Transform this portrait into a retro screen-print / risograph style artwork. Halftone dot patterns, limited ink layers, slight misregistration between color layers for that authentic printed feel. Use only two ink colors: deep black and bright orange (#ff5f1f) on a dark charcoal background. High contrast, grainy texture, vintage poster aesthetic. The person should be clearly recognizable. Think classic screen-printed band poster or Shepard Fairey-style portrait. Do not add any text or watermarks.',
      'common',
      '2d',
      100
    ),
    (
      v_event_id,
      '3D Model',
      'Transform this portrait into a clean 3D rendered character bust. Stylized proportions, smooth surfaces, subtle orange (#ff5f1f) rim lighting on a dark background. The character should be clearly recognizable as the person in the photo.',
      'rare',
      '3d',
      15
    )
  on conflict do nothing;
end $$;
