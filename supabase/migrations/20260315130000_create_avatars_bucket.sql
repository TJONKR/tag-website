-- Create avatars storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies (created via dashboard, kept here for reference)
-- Policies already exist: upload, update, delete (own), public read
