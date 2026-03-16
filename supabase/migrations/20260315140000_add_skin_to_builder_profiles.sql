-- Add skin_url column and generating_skin status to builder_profiles

alter table builder_profiles add column skin_url text;

-- Replace the inline check constraint on status to include 'generating_skin'
alter table builder_profiles drop constraint builder_profiles_status_check;
alter table builder_profiles add constraint builder_profiles_status_check
  check (status in ('pending', 'researching', 'formatting', 'generating_skin', 'complete', 'error'));
