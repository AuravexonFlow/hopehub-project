-- ═══════════════════════════════════════════════════════════
--  Best C2 Students — Monthly Spotlight Table
--  Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS best_c2_students (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT '',
  achievement TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  spotlight_month INTEGER NOT NULL CHECK (spotlight_month BETWEEN 1 AND 12),
  spotlight_year INTEGER NOT NULL,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by month/year
CREATE INDEX IF NOT EXISTS idx_c2_students_spotlight
  ON best_c2_students(spotlight_year DESC, spotlight_month DESC);

-- RLS: public read, admin write
ALTER TABLE best_c2_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published c2 students" ON best_c2_students
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage c2 students" ON best_c2_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
