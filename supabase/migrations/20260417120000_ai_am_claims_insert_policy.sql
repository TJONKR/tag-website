-- ai_am_claims initially shipped with SELECT/own, ALL/super_admin, ALL/service_role
-- policies, but no INSERT policy for the authenticated user creating their own
-- claim. The Claim dialog therefore failed with
-- "new row violates row-level security policy for table ai_am_claims".
--
-- Allow a signed-in user to create a pending claim for themselves. Status is
-- constrained to 'pending' so users can't self-approve; the partial unique
-- index already prevents duplicate pending claims per user.

CREATE POLICY "Users can create own ai_am_claims"
  ON ai_am_claims FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );
