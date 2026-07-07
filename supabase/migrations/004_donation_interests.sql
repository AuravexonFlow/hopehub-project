-- ═══════════════════════════════════════════════════════════
-- 004 — Donation Interests & Messages
-- Connects donors with admins through expression of interest
-- ═══════════════════════════════════════════════════════════

-- Donation Interests: donors express interest in specific requests
CREATE TABLE IF NOT EXISTS donation_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id TEXT NOT NULL,
  request_title TEXT NOT NULL,
  category_id TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  message TEXT,
  interest_type TEXT NOT NULL DEFAULT 'general' CHECK (interest_type IN ('general', 'items', 'cash', 'both')),
  estimated_amount NUMERIC DEFAULT 0,
  estimated_items TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'converted', 'closed')),
  admin_response TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donation_interests_user ON donation_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_interests_request ON donation_interests(request_id);
CREATE INDEX IF NOT EXISTS idx_donation_interests_status ON donation_interests(status);
CREATE INDEX IF NOT EXISTS idx_donation_interests_created ON donation_interests(created_at DESC);

-- RLS policies
ALTER TABLE donation_interests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert (express interest)
CREATE POLICY "Authenticated users can insert interests"
  ON donation_interests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can read their own interests
CREATE POLICY "Users can read own interests"
  ON donation_interests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Admins can update any interest (respond, change status)
CREATE POLICY "Admins can update interests"
  ON donation_interests FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Admins can delete interests
CREATE POLICY "Admins can delete interests"
  ON donation_interests FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_donation_interest_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS donation_interests_updated_at ON donation_interests;
CREATE TRIGGER donation_interests_updated_at
  BEFORE UPDATE ON donation_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_donation_interest_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE donation_interests;
