-- Add onboarding fields to profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES applications(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT true;

-- Existing users keep onboarding_completed = true (the default)
-- New invited users will have it set to false by the trigger
