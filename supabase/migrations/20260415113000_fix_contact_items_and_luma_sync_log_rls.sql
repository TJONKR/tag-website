-- Lock down contact_items and luma_sync_log with explicit RLS policies.
-- contact_items should be readable by signed-in members and writable by operators.
-- luma_sync_log should only be reachable through service-role-backed code paths.

CREATE TABLE IF NOT EXISTS public.contact_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'building',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.contact_items (title, description, icon, sort_order)
SELECT 'Address', 'Jacob Bontiusplaats 9, 1018 LL Amsterdam', 'mappin', 0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.contact_items
  WHERE title = 'Address'
    AND description = 'Jacob Bontiusplaats 9, 1018 LL Amsterdam'
);

INSERT INTO public.contact_items (title, description, icon, sort_order)
SELECT
  'Communication',
  'We use WhatsApp for general communication. You''ll be added to the group when you join.',
  'hash',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM public.contact_items
  WHERE title = 'Communication'
    AND description = 'We use WhatsApp for general communication. You''ll be added to the group when you join.'
);

ALTER TABLE public.contact_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luma_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read contact_items" ON public.contact_items;
CREATE POLICY "Authenticated users can read contact_items"
  ON public.contact_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Operators can manage contact_items" ON public.contact_items;
CREATE POLICY "Operators can manage contact_items"
  ON public.contact_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'operator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'operator'
    )
  );

DROP POLICY IF EXISTS "Service role full access on luma_sync_log" ON public.luma_sync_log;
CREATE POLICY "Service role full access on luma_sync_log"
  ON public.luma_sync_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
