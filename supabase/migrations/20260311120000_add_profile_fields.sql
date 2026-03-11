-- Add profile fields for the merged join/register form
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS building text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS why_tag text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url text;
