-- Create witness_verifications table for Aha-Moment #2
CREATE TABLE IF NOT EXISTS witness_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  witness_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  verification_comment TEXT,
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure a witness can only be verified once per experience
  UNIQUE(experience_id, witness_user_id)
);

-- Add RLS policies
ALTER TABLE witness_verifications ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read verifications
CREATE POLICY "Anyone can view witness verifications"
  ON witness_verifications
  FOR SELECT
  USING (true);

-- Only experience author can create verifications
CREATE POLICY "Experience author can create witness verifications"
  ON witness_verifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_user_id
    AND EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = experience_id
      AND experiences.user_id = auth.uid()
    )
  );

-- Only experience author can update their verifications
CREATE POLICY "Experience author can update their witness verifications"
  ON witness_verifications
  FOR UPDATE
  USING (auth.uid() = author_user_id)
  WITH CHECK (auth.uid() = author_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_witness_verifications_experience_id ON witness_verifications(experience_id);
CREATE INDEX IF NOT EXISTS idx_witness_verifications_witness_user_id ON witness_verifications(witness_user_id);
CREATE INDEX IF NOT EXISTS idx_witness_verifications_status ON witness_verifications(status);

-- Create updated_at trigger
CREATE TRIGGER update_witness_verifications_updated_at
  BEFORE UPDATE ON witness_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add verified-witness badge if it doesn't exist
INSERT INTO badges (slug, name, description, icon, rarity, category, criteria)
VALUES (
  'verified-witness',
  'Verified Witness',
  'Du wurdest als Zeuge einer Experience verifiziert',
  '✅',
  'rare',
  'basic',
  jsonb_build_object(
    'type', 'manual',
    'description', 'Wird vom Experience-Author manuell vergeben'
  )
)
ON CONFLICT (slug) DO NOTHING;
