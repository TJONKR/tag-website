-- Migrate existing 'fan' rows to 'ambassador'
UPDATE profiles SET role = 'ambassador' WHERE role = 'fan';

-- Update default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'ambassador';
