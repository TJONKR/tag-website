-- ─── Add epic rarity tier ─────────────────────────────────────
-- Drop and recreate check constraints to include 'epic'

alter table lootbox_styles drop constraint lootbox_styles_rarity_check;
alter table lootbox_styles add constraint lootbox_styles_rarity_check
  check (rarity in ('common', 'rare', 'epic'));

alter table user_skins drop constraint user_skins_rarity_check;
alter table user_skins add constraint user_skins_rarity_check
  check (rarity in ('common', 'rare', 'epic'));

-- ─── Global style pool ───────────────────────────────────────
-- Make event_id nullable so global styles can have event_id = NULL
alter table lootbox_styles alter column event_id drop not null;
