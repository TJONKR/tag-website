-- Add Luma integration fields to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS luma_event_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS luma_url text,
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz,
  ADD COLUMN IF NOT EXISTS cover_url text;

CREATE INDEX IF NOT EXISTS idx_events_luma_event_id ON events (luma_event_id) WHERE luma_event_id IS NOT NULL;

-- Add Luma integration fields to event_attendance table
ALTER TABLE event_attendance
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS luma_guest_id text,
  ADD COLUMN IF NOT EXISTS luma_approval_status text,
  ADD COLUMN IF NOT EXISTS registered_at timestamptz,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_event_attendance_luma_guest_id ON event_attendance (luma_guest_id) WHERE luma_guest_id IS NOT NULL;

-- Sync audit log
CREATE TABLE IF NOT EXISTS luma_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL,
  status text NOT NULL,
  details jsonb DEFAULT '{}',
  events_synced int DEFAULT 0,
  guests_synced int DEFAULT 0,
  error text,
  triggered_by text,
  created_at timestamptz DEFAULT now()
);
