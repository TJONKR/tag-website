-- Support for events that appear on the TAG Luma calendar but are owned by
-- another calendar (co-hosted / pinned). The Luma API refuses to return these
-- via list-events or event/get, so we ingest them from the public ICS feed
-- and enrich via the public event page.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_externally_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_host text;

CREATE INDEX IF NOT EXISTS idx_events_is_externally_managed
  ON events (is_externally_managed)
  WHERE is_externally_managed = true;
