-- ═══════════════════════════════════════════════════════════
--  Content Tables — Notices, Events, News, Donations
--  Full CRUD with RLS policies for admin access
--  NOTE: "full" and "desc" are PostgreSQL reserved keywords,
--  so we use full_content and event_desc as column names.
-- ═══════════════════════════════════════════════════════════

-- ─── Notices Table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notices (
  id            TEXT PRIMARY KEY,
  date          TEXT NOT NULL DEFAULT '',
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL DEFAULT '',
  full_content  TEXT NOT NULL DEFAULT '',
  tag           TEXT NOT NULL DEFAULT 'Update',
  icon          TEXT NOT NULL DEFAULT 'megaphone',
  photos        JSONB NOT NULL DEFAULT '[]',
  published     BOOLEAN NOT NULL DEFAULT true,
  created_at    TEXT NOT NULL DEFAULT ''
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read notices" ON notices
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage notices" ON notices
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

GRANT SELECT ON notices TO anon;
GRANT ALL PRIVILEGES ON notices TO authenticated, service_role;

-- ─── Events Table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id               TEXT PRIMARY KEY,
  date             TEXT NOT NULL DEFAULT '',
  title            TEXT NOT NULL,
  event_desc       TEXT NOT NULL DEFAULT '',
  full_content     TEXT NOT NULL DEFAULT '',
  tag              TEXT NOT NULL DEFAULT 'Upcoming',
  icon             TEXT NOT NULL DEFAULT 'calendar',
  stats            TEXT NOT NULL DEFAULT '',
  photos           JSONB NOT NULL DEFAULT '[]',
  thumbnail_index  INTEGER NOT NULL DEFAULT 0,
  hero_index       INTEGER NOT NULL DEFAULT 0,
  video_url        TEXT,
  published        BOOLEAN NOT NULL DEFAULT true,
  created_at       TEXT NOT NULL DEFAULT ''
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events" ON events
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage events" ON events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

GRANT SELECT ON events TO anon;
GRANT ALL PRIVILEGES ON events TO authenticated, service_role;

-- ─── News Table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS news (
  id            TEXT PRIMARY KEY,
  date          TEXT NOT NULL DEFAULT '',
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL DEFAULT '',
  full_content  TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'Report',
  icon          TEXT NOT NULL DEFAULT 'newspaper',
  read_time     TEXT NOT NULL DEFAULT '3 min read',
  published     BOOLEAN NOT NULL DEFAULT true,
  created_at    TEXT NOT NULL DEFAULT ''
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read news" ON news
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage news" ON news
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

GRANT SELECT ON news TO anon;
GRANT ALL PRIVILEGES ON news TO authenticated, service_role;

-- ─── Donation Categories Table ────────────────────────────

CREATE TABLE IF NOT EXISTS donation_categories (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT 'heart',
  description   TEXT NOT NULL DEFAULT '',
  goal          NUMERIC NOT NULL DEFAULT 0,
  raised        NUMERIC NOT NULL DEFAULT 0,
  color         TEXT NOT NULL DEFAULT '#e02040',
  urgency       TEXT NOT NULL DEFAULT 'Medium',
  published     BOOLEAN NOT NULL DEFAULT true,
  coming_soon   BOOLEAN NOT NULL DEFAULT false,
  created_at    TEXT NOT NULL DEFAULT ''
);

ALTER TABLE donation_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read donations" ON donation_categories
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage donations" ON donation_categories
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

GRANT SELECT ON donation_categories TO anon;
GRANT ALL PRIVILEGES ON donation_categories TO authenticated, service_role;

-- ─── Reload PostgREST schema cache ────────────────────────

NOTIFY pgrst, 'reload schema';
