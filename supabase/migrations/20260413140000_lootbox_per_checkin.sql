-- ─── Lootbox per check-in ─────────────────────────────────────
-- Grant a lootbox each time a user is checked in at an event.
-- Idempotent via unique (user_id, source_event_id) so re-syncs / re-runs
-- don't double-grant.

-- 1. Track which event check-in produced a lootbox
alter table user_lootboxes
  add column if not exists source_event_id uuid references events(id) on delete set null;

create unique index if not exists user_lootboxes_user_source_event_idx
  on user_lootboxes (user_id, source_event_id)
  where source_event_id is not null;

-- 2. Trigger: when checked_in_at flips from NULL → NOT NULL, grant lootbox
create or replace function grant_lootbox_on_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.checked_in_at is not null
     and (tg_op = 'INSERT' or old.checked_in_at is null) then
    insert into user_lootboxes (user_id, source_event_id, status)
    values (new.user_id, new.event_id, 'available')
    on conflict (user_id, source_event_id) where source_event_id is not null do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists grant_lootbox_on_checkin_trg on event_attendance;
create trigger grant_lootbox_on_checkin_trg
  after insert or update of checked_in_at on event_attendance
  for each row execute function grant_lootbox_on_checkin();

-- 3. Backfill: existing checked-in attendance gets a lootbox
insert into user_lootboxes (user_id, source_event_id, status)
select user_id, event_id, 'available'
from event_attendance
where checked_in_at is not null
on conflict (user_id, source_event_id) where source_event_id is not null do nothing;

-- 4. Extra test lootboxes for tijs@lerai.nl (unsourced, just for trying things)
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'tijs@lerai.nl';
  if v_user_id is not null then
    insert into user_lootboxes (user_id, status)
    select v_user_id, 'available' from generate_series(1, 5);
  end if;
end $$;
