-- Add expired column to career_resources
-- Allows admins to manually mark opportunities as ended/past

ALTER TABLE career_resources
ADD COLUMN IF NOT EXISTS expired BOOLEAN DEFAULT false;

-- Backfill: mark resources with past deadlines as expired
UPDATE career_resources
SET expired = true
WHERE deadline IS NOT NULL
  AND deadline != ''
  AND deadline < CURRENT_DATE::text
  AND expired = false;
