-- Payment & Contract overhaul:
-- 1. Add is_super_admin flag (orthogonal to role; only Tijs + Pieter)
-- 2. Add contract field columns (company, KVK, city, representative, language)
-- 3. New ai_am_claims table for users who already pay AI AM directly

-- Step 1: super admin flag (orthogonal to role enum, preserves operator capabilities)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin
  ON profiles(is_super_admin) WHERE is_super_admin = true;

-- Step 2: contract field data (TAG onderhuur-contract v2.0)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS kvk text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS representative_name text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS language text
  CHECK (language IS NULL OR language IN ('nl', 'en'));

-- Step 3: ai_am_claims — users claiming an existing direct AI AM contract
CREATE TABLE IF NOT EXISTS ai_am_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  notes text
);

ALTER TABLE ai_am_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ai_am_claims"
  ON ai_am_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admin full access on ai_am_claims"
  ON ai_am_claims FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Service role full access on ai_am_claims"
  ON ai_am_claims FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_ai_am_claims_user_id ON ai_am_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_am_claims_status ON ai_am_claims(status);

-- Partial unique index: at most one pending claim per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_am_claims_one_pending
  ON ai_am_claims(user_id) WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- MANUAL SEED (run separately after deploy via SQL editor):
--
-- UPDATE profiles SET is_super_admin = true
-- WHERE email IN ('tijs@<domain>', 'pieter@<domain>');
--
-- (replace with actual emails — emails live in auth.users, join via id)
-- Example with auth join:
-- UPDATE profiles p SET is_super_admin = true
-- FROM auth.users u
-- WHERE p.id = u.id AND u.email IN ('tijs@...', 'pieter@...');
-- ---------------------------------------------------------------------------
