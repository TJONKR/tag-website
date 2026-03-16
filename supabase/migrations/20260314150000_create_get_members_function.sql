-- Function to get all members with their email from auth.users
-- Uses SECURITY DEFINER to access auth.users (not accessible via RLS)

CREATE OR REPLACE FUNCTION public.get_members()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  avatar_url text,
  building text,
  onboarding_completed boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    u.email::text,
    p.name,
    p.role::text,
    p.avatar_url,
    p.building,
    p.onboarding_completed,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
