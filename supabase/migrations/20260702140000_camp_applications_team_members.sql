-- Team applications now carry structured teammates (name, email, link each)
-- instead of a free-text team description. Table is empty, so dropping the
-- old column is safe.

ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS team_members jsonb;
ALTER TABLE camp_applications DROP COLUMN IF EXISTS team_info;
