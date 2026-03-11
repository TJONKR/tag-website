-- Step 2: Rename existing roles (enum values committed in previous migration)
UPDATE profiles SET role = 'fan' WHERE role = 'rookie';
UPDATE profiles SET role = 'operator' WHERE role = 'admin';

-- Set new default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'fan';
