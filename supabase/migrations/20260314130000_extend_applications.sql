-- Extend applications table with status, social URLs, and review tracking

ALTER TABLE applications ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id);

-- Ensure status is one of the allowed values
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Allow authenticated users to read applications (operators will be filtered in app code)
CREATE POLICY "Authenticated users can read applications"
  ON applications FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update applications (operator check in app code)
CREATE POLICY "Authenticated users can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
