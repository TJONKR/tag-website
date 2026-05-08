-- Stable, unique URL slug per profile. Resolves collisions where two members
-- share a name: oldest wins the bare slug, later collisions get -2, -3, etc.
-- Slug is set once on insert and is intentionally not regenerated when name
-- changes (preserves inbound links / SEO).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.generate_profile_slug(input_name text, exclude_id uuid DEFAULT NULL)
RETURNS text AS $$
DECLARE
  base text;
  candidate text;
  n int := 1;
BEGIN
  base := lower(coalesce(input_name, ''));
  -- Strip common Latin diacritics
  base := translate(base,
    'àáâãäåèéêëìíîïòóôõöùúûüýÿñçß',
    'aaaaaaeeeeiiiiooooouuuuyyncs');
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := regexp_replace(base, '(^-|-$)', '', 'g');
  IF base = '' THEN base := 'member'; END IF;

  candidate := base;
  WHILE EXISTS (
    SELECT 1 FROM public.profiles
    WHERE slug = candidate
      AND (exclude_id IS NULL OR id <> exclude_id)
  ) LOOP
    n := n + 1;
    candidate := base || '-' || n::text;
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Backfill existing rows in created_at order so earliest member keeps the bare slug
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, name FROM public.profiles WHERE slug IS NULL ORDER BY created_at NULLS LAST, id LOOP
    UPDATE public.profiles
    SET slug = public.generate_profile_slug(coalesce(r.name, 'member'), r.id)
    WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_unique ON public.profiles(slug);
ALTER TABLE public.profiles ALTER COLUMN slug SET NOT NULL;

-- Auto-assign slug on insert when caller (trigger or app) didn't provide one
CREATE OR REPLACE FUNCTION public.set_profile_slug_on_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_profile_slug(coalesce(NEW.name, 'member'), NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_set_slug ON public.profiles;
CREATE TRIGGER profiles_set_slug
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profile_slug_on_insert();

-- Expose slug via the get_members RPC used by the people list.
-- DROP first because return type changed (Postgres rejects CREATE OR REPLACE
-- when row type differs).
DROP FUNCTION IF EXISTS public.get_members();
CREATE FUNCTION public.get_members()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  slug text,
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
    p.slug,
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
