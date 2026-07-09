-- ═══════════════════════════════════════════════════════════
--  Career Resources — Admin-managed career opportunities
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS career_resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  -- Categories: internship, job, scholarship, higher-education, training, general
  icon TEXT DEFAULT '📋',
  color TEXT DEFAULT '#3b82f6',
  image_url TEXT,
  link_url TEXT,
  location TEXT,
  deadline TEXT,
  contact_info TEXT,
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TEXT DEFAULT (date('now'))
);

-- Public can read published resources
GRANT SELECT ON career_resources TO anon;
-- Authenticated users (admins) can do everything
GRANT ALL ON career_resources TO authenticated;
GRANT ALL ON career_resources TO service_role;

-- RLS: anyone can read published, admins can do all
ALTER TABLE career_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published career resources"
  ON career_resources FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage all career resources"
  ON career_resources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
