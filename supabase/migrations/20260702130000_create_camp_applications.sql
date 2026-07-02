-- Summer Camp applications submitted via /summer-camp/apply.
-- Distinct from `applications` (community membership) and
-- `event_host_applications` (external event hosts).
-- Reviewed by operators; acceptance is discussed on an application call.

CREATE TABLE IF NOT EXISTS camp_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact
  name text NOT NULL,
  email text NOT NULL,
  link_url text,

  -- Team
  applying_as text NOT NULL,
  team_info text,
  open_to_team boolean,

  -- Startup
  stage text NOT NULL,
  building text NOT NULL,
  shipped_before text,

  -- Commitment
  hours_per_week text NOT NULL,
  away_dates text,
  september_vision text NOT NULL,

  -- Desk (a desk at TAG is part of joining the camp)
  desk_commitment text NOT NULL,
  desk_interest_regardless boolean NOT NULL DEFAULT false,

  -- Source
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

  CONSTRAINT camp_applications_applying_as_check
    CHECK (applying_as IN ('solo', 'team')),
  CONSTRAINT camp_applications_stage_check
    CHECK (stage IN ('ambition', 'half_product', 'shipped_no_revenue', 'shipped_revenue')),
  CONSTRAINT camp_applications_desk_commitment_check
    CHECK (desk_commitment IN ('committed', 'discuss_on_call')),
  CONSTRAINT camp_applications_status_check
    CHECK (status IN ('pending', 'call_scheduled', 'accepted', 'rejected', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_camp_applications_status
  ON camp_applications (status);

CREATE INDEX IF NOT EXISTS idx_camp_applications_created_at
  ON camp_applications (created_at DESC);

ALTER TABLE camp_applications ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON camp_applications TO anon;
GRANT INSERT ON camp_applications TO authenticated;

-- Anonymous (and authenticated) users can submit applications.
CREATE POLICY "Allow public inserts"
  ON camp_applications FOR INSERT
  WITH CHECK (true);

-- Only operators can read applications.
CREATE POLICY "Operators can read camp applications"
  ON camp_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'operator'
    )
  );

-- Only operators can update (review / notes).
CREATE POLICY "Operators can update camp applications"
  ON camp_applications FOR UPDATE
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
