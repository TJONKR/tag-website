-- External event-host requests submitted via /host-event.
-- Distinct from the existing `applications` table which tracks community
-- membership applications. Reviewed by operators in /portal/event-requests.

CREATE TABLE IF NOT EXISTS event_host_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  organization text,

  -- Event
  event_title text NOT NULL,
  event_type text NOT NULL,
  description text NOT NULL,
  expected_attendees integer,
  proposed_date date,
  proposed_date_flexible boolean NOT NULL DEFAULT false,
  duration_hours numeric(4, 1),

  -- Links & source
  website_url text,
  social_url text,
  referral text,

  -- Review
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),

  -- Meta (spam / rate-limit)
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,

  CONSTRAINT event_host_applications_event_type_check
    CHECK (event_type IN ('talk', 'workshop', 'meetup', 'hackathon', 'launch', 'other')),
  CONSTRAINT event_host_applications_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_event_host_applications_status
  ON event_host_applications (status);

CREATE INDEX IF NOT EXISTS idx_event_host_applications_created_at
  ON event_host_applications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_host_applications_ip_hash_created_at
  ON event_host_applications (ip_hash, created_at DESC);

ALTER TABLE event_host_applications ENABLE ROW LEVEL SECURITY;

-- Anonymous (and authenticated) users can submit requests.
CREATE POLICY "Allow public inserts"
  ON event_host_applications FOR INSERT
  WITH CHECK (true);

-- Only operators can read submitted applications.
CREATE POLICY "Operators can read event host applications"
  ON event_host_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );

-- Only operators can update (approve / reject / archive / notes).
CREATE POLICY "Operators can update event host applications"
  ON event_host_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );
