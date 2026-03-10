-- Step 1: Add new enum values (must be committed before use)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'fan';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator';

-- Add stripe_customer_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'incomplete'
    CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Contracts table
CREATE TABLE contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  version text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on contracts"
  ON contracts FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_contracts_user_id ON contracts(user_id);

-- Contracts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;
