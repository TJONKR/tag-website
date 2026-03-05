-- Grant insert permission to anon role
grant insert on applications to anon;

-- Recreate policy explicitly for all roles
drop policy if exists "Allow public inserts" on applications;

create policy "Allow public inserts"
  on applications for insert
  to anon, authenticated
  with check (true);
