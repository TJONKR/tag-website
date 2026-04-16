-- Harden handle_new_user(): a failure in the application-copy path must NOT
-- abort the auth.users insert. Previously a bad application_id cast or any
-- constraint violation in the copy path would roll back the whole signup,
-- leaving the user unable to retry without manual cleanup. We now:
--   1. Safely parse application_id (invalid UUIDs become NULL instead of throwing)
--   2. Try the application-copy insert inside an EXCEPTION block; on failure,
--      log a warning and fall through to the bare profile insert
--   3. Wrap the bare insert in its own EXCEPTION block as a final safety net,
--      so the auth user always succeeds even if profile creation fully fails
--      (the app layer will heal a missing profile lazily on first read)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  app_record RECORD;
  app_id uuid;
  app_id_text text;
BEGIN
  app_id_text := new.raw_user_meta_data ->> 'application_id';

  -- Safe cast: invalid UUIDs become NULL rather than throwing
  IF app_id_text IS NOT NULL THEN
    BEGIN
      app_id := app_id_text::uuid;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '[handle_new_user] invalid application_id in user metadata: %', app_id_text;
      app_id := NULL;
    END;
  END IF;

  IF app_id IS NOT NULL THEN
    SELECT * INTO app_record FROM public.applications WHERE id = app_id;

    IF FOUND THEN
      BEGIN
        INSERT INTO public.profiles (
          id, name, onboarding_completed, application_id,
          building, why_tag, referral,
          linkedin_url, twitter_url, github_url, website_url, instagram_url
        )
        VALUES (
          new.id,
          coalesce(app_record.name, new.raw_user_meta_data ->> 'name'),
          false,
          app_id,
          app_record.building,
          app_record.why_tag,
          app_record.referral,
          app_record.linkedin_url,
          app_record.twitter_url,
          app_record.github_url,
          app_record.website_url,
          app_record.instagram_url
        )
        ON CONFLICT (id) DO NOTHING;

        RETURN new;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '[handle_new_user] application-copy insert failed for user %: % (falling back to bare profile)', new.id, SQLERRM;
        -- Fall through to bare insert below
      END;
    END IF;
  END IF;

  -- Bare profile insert — final safety net, never aborts the auth user
  BEGIN
    INSERT INTO public.profiles (id, name, onboarding_completed)
    VALUES (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'name', null),
      false
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] bare profile insert failed for user %: % (app layer will heal on first read)', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
