-- Allow anonymous users to count profiles (for homepage member counter)
CREATE POLICY "Anyone can count profiles"
  ON profiles FOR SELECT
  USING (true);
