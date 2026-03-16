-- Storage RLS policies for user-photos bucket
-- Users can upload to their own folder: user-photos/{user_id}/*

create policy "Users can upload own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Service role full access on user-photos storage"
  on storage.objects for all
  using (
    bucket_id = 'user-photos'
    and auth.role() = 'service_role'
  );
