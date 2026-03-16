-- Update handle_new_user() to support onboarding flow
-- When a user is created via invite, copy application data to their profile

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  app_record RECORD;
  app_id uuid;
BEGIN
  -- Check if an application_id was passed via user metadata
  app_id := (new.raw_user_meta_data ->> 'application_id')::uuid;

  IF app_id IS NOT NULL THEN
    -- Look up the application
    SELECT * INTO app_record FROM public.applications WHERE id = app_id;

    IF FOUND THEN
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
    END IF;
  END IF;

  -- Default: no application linked (e.g. direct invite without application)
  INSERT INTO public.profiles (id, name, onboarding_completed)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', null),
    false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
