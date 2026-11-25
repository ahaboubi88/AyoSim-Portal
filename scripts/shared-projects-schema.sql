-- AyoSim Ephemeral Project Sharing Schema (Phase 9)
-- Safe additive migration: does not modify existing auth.users or portal tables.
-- Run this in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.shared_projects (
  id TEXT PRIMARY KEY DEFAULT substring(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  board_type TEXT NOT NULL CHECK (board_type IN ('arduino', 'esp32', 'rpi')),
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  project_data JSONB NOT NULL CHECK (octet_length(project_data::text) <= 262144),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours')
);

CREATE INDEX IF NOT EXISTS idx_shared_projects_expires_at
  ON public.shared_projects (expires_at);

-- Enable Row Level Security
ALTER TABLE public.shared_projects ENABLE ROW LEVEL SECURITY;

-- Public read only while unexpired
DROP POLICY IF EXISTS "Public read unexpired shared projects" ON public.shared_projects;
CREATE POLICY "Public read unexpired shared projects"
  ON public.shared_projects
  FOR SELECT
  USING (expires_at > now());

-- Anyone can create a share link, strictly capped at <= 49h TTL
DROP POLICY IF EXISTS "Public insert ephemeral shared projects" ON public.shared_projects;
CREATE POLICY "Public insert ephemeral shared projects"
  ON public.shared_projects
  FOR INSERT
  WITH CHECK (
    expires_at > now()
    AND expires_at <= now() + interval '49 hours'
  );

-- Grant anon & authenticated REST access
GRANT SELECT, INSERT ON public.shared_projects TO anon, authenticated;

-- Automatic hourly cleanup via pg_cron (enable pg_cron in Database > Extensions first)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule if re-running script, then schedule hourly purge
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-expired-shared-projects') THEN
    PERFORM cron.unschedule('purge-expired-shared-projects');
  END IF;
END $$;

SELECT cron.schedule(
  'purge-expired-shared-projects',
  '0 * * * *',
  $$DELETE FROM public.shared_projects WHERE expires_at < now()$$
);
