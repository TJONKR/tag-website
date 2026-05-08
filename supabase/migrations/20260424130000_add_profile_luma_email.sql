-- Add luma_email to profiles so users can match their Luma account to their TAG
-- account when their Luma email differs from their auth email.
alter table profiles
  add column if not exists luma_email text;

create index if not exists profiles_luma_email_idx on profiles (lower(luma_email));
