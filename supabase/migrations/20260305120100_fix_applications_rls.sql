-- Drop the old policy and recreate with correct permissions
drop policy if exists "Allow public inserts" on applications;

create policy "Allow public inserts"
  on applications for insert
  with check (true);
