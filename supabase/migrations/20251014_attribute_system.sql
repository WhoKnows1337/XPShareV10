-- ═════════════════════════════════════════════════════════════════════
-- XPSHARE ATTRIBUTE SYSTEM
-- Migration: 20251014_attribute_system
-- Description: Complete attribute system for structured experience data
-- ═════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════════
-- TABLE 1: ATTRIBUTE SCHEMA (defines available attributes)
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS attribute_schema (
  key text PRIMARY KEY,                        -- "shape", "surface", etc.
  display_name text NOT NULL,                  -- "Form/Shape"
  display_name_de text,                        -- "Form"
  display_name_fr text,                        -- "Forme"
  display_name_es text,                        -- "Forma"
  category_slug text,                          -- "ufo-uap" (optional: category-specific)
  data_type text DEFAULT 'text' CHECK (data_type IN ('text', 'enum', 'number', 'boolean')),
  allowed_values jsonb,                        -- ["triangle", "disc", "orb"] for enums
  description text,
  is_searchable boolean DEFAULT true,
  is_filterable boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attr_schema_category ON attribute_schema(category_slug);
CREATE INDEX IF NOT EXISTS idx_attr_schema_searchable ON attribute_schema(is_searchable) WHERE is_searchable = true;
CREATE INDEX IF NOT EXISTS idx_attr_schema_filterable ON attribute_schema(is_filterable) WHERE is_filterable = true;

COMMENT ON TABLE attribute_schema IS 'Defines available attributes and their properties';
COMMENT ON COLUMN attribute_schema.key IS 'Unique technical identifier (lowercase, no spaces)';
COMMENT ON COLUMN attribute_schema.category_slug IS 'Optional: restrict to specific category. NULL = available for all categories';
COMMENT ON COLUMN attribute_schema.data_type IS 'Data type: text, enum, number, or boolean';
COMMENT ON COLUMN attribute_schema.allowed_values IS 'For enum type: JSON array of canonical values (lowercase English)';

-- ═════════════════════════════════════════════════════════════════════
-- TABLE 2: EXPERIENCE ATTRIBUTES (user data)
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS experience_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  attribute_key text NOT NULL REFERENCES attribute_schema(key) ON DELETE CASCADE,
  attribute_value text NOT NULL,               -- Always canonical (lowercase English)
  confidence float CHECK (confidence BETWEEN 0.0 AND 1.0),
  source text DEFAULT 'ai_extracted' CHECK (source IN ('ai_extracted', 'user_confirmed', 'user_edited', 'user_input', 'community_tag')),
  evidence text,                               -- Text snippet that led to extraction
  verified_by_user boolean DEFAULT false,
  replaced_by uuid REFERENCES experience_attributes(id),  -- For tracking corrections
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  -- Prevent duplicate attributes (only one active value per key per experience)
  CONSTRAINT unique_active_attribute UNIQUE(experience_id, attribute_key) WHERE (replaced_by IS NULL)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_exp_attr_experience ON experience_attributes(experience_id);
CREATE INDEX IF NOT EXISTS idx_exp_attr_key_value ON experience_attributes(attribute_key, attribute_value);
CREATE INDEX IF NOT EXISTS idx_exp_attr_key ON experience_attributes(attribute_key);
CREATE INDEX IF NOT EXISTS idx_exp_attr_source ON experience_attributes(source);
CREATE INDEX IF NOT EXISTS idx_exp_attr_confidence ON experience_attributes(confidence);

-- Full-text search for Attribute Values
CREATE INDEX IF NOT EXISTS idx_exp_attr_value_fts ON experience_attributes USING gin(to_tsvector('english', attribute_value));

COMMENT ON TABLE experience_attributes IS 'Stores structured attribute data for experiences';
COMMENT ON COLUMN experience_attributes.attribute_value IS 'Canonical value (lowercase English) - even if user input was different language';
COMMENT ON COLUMN experience_attributes.confidence IS '0.0-1.0: AI confidence or 1.0 for user-confirmed';
COMMENT ON COLUMN experience_attributes.source IS 'Where the attribute came from';
COMMENT ON COLUMN experience_attributes.evidence IS 'Text snippet from original story that supports this attribute';
COMMENT ON COLUMN experience_attributes.replaced_by IS 'If user corrected AI, reference to the replacement attribute';

-- ═════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═════════════════════════════════════════════════════════════════════

ALTER TABLE attribute_schema ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_attributes ENABLE ROW LEVEL SECURITY;

-- attribute_schema: Public read
CREATE POLICY "Public read attribute schema"
  ON attribute_schema FOR SELECT
  USING (true);

-- attribute_schema: Admin only write
CREATE POLICY "Admin write attribute schema"
  ON attribute_schema FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- experience_attributes: Public read for public experiences
CREATE POLICY "Public read experience attributes"
  ON experience_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
      AND e.visibility = 'public'
    )
  );

-- experience_attributes: Users can add/edit attributes to own experiences
CREATE POLICY "Users manage own experience attributes"
  ON experience_attributes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
      AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = experience_attributes.experience_id
      AND e.user_id = auth.uid()
    )
  );

-- ═════════════════════════════════════════════════════════════════════
-- TABLE 3: ATTRIBUTE SUGGESTIONS (community)
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS attribute_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  attribute_key text NOT NULL,
  attribute_value text NOT NULL,
  suggested_by uuid REFERENCES auth.users(id),
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attr_suggest_exp ON attribute_suggestions(experience_id);
CREATE INDEX IF NOT EXISTS idx_attr_suggest_status ON attribute_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_attr_suggest_user ON attribute_suggestions(suggested_by);

COMMENT ON TABLE attribute_suggestions IS 'Community suggestions for new attribute values';

-- RLS
ALTER TABLE attribute_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved suggestions"
  ON attribute_suggestions FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users create suggestions"
  ON attribute_suggestions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users view own suggestions"
  ON attribute_suggestions FOR SELECT
  USING (suggested_by = auth.uid());

-- ═════════════════════════════════════════════════════════════════════
-- TABLE 4: PATTERN INSIGHTS (background analysis results)
-- ═════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pattern_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  pattern_type text NOT NULL CHECK (pattern_type IN (
    'attribute_correlation',
    'category_correlation',
    'geographic_cluster',
    'temporal_pattern',
    'co_occurrence'
  )),
  insight_data jsonb NOT NULL,
  strength float CHECK (strength BETWEEN 0.0 AND 1.0),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,  -- Optional: for cache invalidation

  -- Prevent duplicate insights
  CONSTRAINT unique_pattern_per_experience UNIQUE(experience_id, pattern_type)
);

CREATE INDEX IF NOT EXISTS idx_pattern_exp ON pattern_insights(experience_id);
CREATE INDEX IF NOT EXISTS idx_pattern_type ON pattern_insights(pattern_type);
CREATE INDEX IF NOT EXISTS idx_pattern_strength ON pattern_insights(strength);
CREATE INDEX IF NOT EXISTS idx_pattern_expires ON pattern_insights(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE pattern_insights IS 'Stores pattern discovery results for experiences';
COMMENT ON COLUMN pattern_insights.pattern_type IS 'Type of pattern discovered';
COMMENT ON COLUMN pattern_insights.insight_data IS 'JSON data with pattern details';
COMMENT ON COLUMN pattern_insights.strength IS 'Correlation strength 0.0-1.0';

-- RLS
ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pattern insights"
  ON pattern_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences e
      WHERE e.id = pattern_insights.experience_id
      AND e.visibility = 'public'
    )
  );

-- ═════════════════════════════════════════════════════════════════════
-- UPDATE: dynamic_questions table (add attribute mapping)
-- ═════════════════════════════════════════════════════════════════════

-- Add column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dynamic_questions'
    AND column_name = 'maps_to_attribute'
  ) THEN
    ALTER TABLE dynamic_questions
    ADD COLUMN maps_to_attribute text REFERENCES attribute_schema(key);

    CREATE INDEX IF NOT EXISTS idx_questions_maps_to ON dynamic_questions(maps_to_attribute);

    COMMENT ON COLUMN dynamic_questions.maps_to_attribute IS 'Optional: Links question to attribute_schema for pre-filling';
  END IF;
END $$;

-- ═════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═════════════════════════════════════════════════════════════════════

-- Function: Get attributes for an experience with localization
CREATE OR REPLACE FUNCTION get_experience_attributes(
  p_experience_id uuid,
  p_locale text DEFAULT 'en'
)
RETURNS TABLE (
  attribute_key text,
  attribute_value text,
  display_name text,
  display_value text,
  confidence float,
  source text,
  verified_by_user boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ea.attribute_key,
    ea.attribute_value,
    CASE p_locale
      WHEN 'de' THEN COALESCE(s.display_name_de, s.display_name)
      WHEN 'fr' THEN COALESCE(s.display_name_fr, s.display_name)
      WHEN 'es' THEN COALESCE(s.display_name_es, s.display_name)
      ELSE s.display_name
    END as display_name,
    ea.attribute_value as display_value, -- TODO: Add translation layer
    ea.confidence,
    ea.source,
    ea.verified_by_user
  FROM experience_attributes ea
  JOIN attribute_schema s ON ea.attribute_key = s.key
  WHERE ea.experience_id = p_experience_id
    AND ea.replaced_by IS NULL  -- Only active attributes
  ORDER BY s.sort_order, ea.created_at;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_experience_attributes IS 'Get all active attributes for an experience with localization';

-- Function: Search experiences by attributes
CREATE OR REPLACE FUNCTION search_by_attributes(
  p_attribute_filters jsonb,  -- {"shape": "triangle", "surface": "metallic"}
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  experience_id uuid,
  matching_count bigint,
  total_attributes bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_experiences AS (
    SELECT
      ea.experience_id,
      COUNT(*) as matching_count,
      (
        SELECT COUNT(*)
        FROM experience_attributes ea2
        WHERE ea2.experience_id = ea.experience_id
        AND ea2.replaced_by IS NULL
      ) as total_attributes
    FROM experience_attributes ea
    WHERE
      ea.replaced_by IS NULL
      AND jsonb_build_object(ea.attribute_key, ea.attribute_value) <@ p_attribute_filters
    GROUP BY ea.experience_id
  )
  SELECT
    fe.experience_id,
    fe.matching_count,
    fe.total_attributes
  FROM filtered_experiences fe
  JOIN experiences e ON e.id = fe.experience_id
  WHERE e.visibility = 'public'
  ORDER BY fe.matching_count DESC, e.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_by_attributes IS 'Search experiences by attribute filters';

-- Function: Get attribute value counts for filtering UI
CREATE OR REPLACE FUNCTION get_attribute_value_counts(
  p_attribute_key text,
  p_category_slug text DEFAULT NULL
)
RETURNS TABLE (
  attribute_value text,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ea.attribute_value,
    COUNT(DISTINCT ea.experience_id) as count
  FROM experience_attributes ea
  JOIN experiences e ON e.id = ea.experience_id
  WHERE
    ea.attribute_key = p_attribute_key
    AND ea.replaced_by IS NULL
    AND e.visibility = 'public'
    AND (p_category_slug IS NULL OR e.category = p_category_slug)
  GROUP BY ea.attribute_value
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_attribute_value_counts IS 'Get counts of attribute values for filter UI (e.g., "triangle: 89, disc: 67")';

-- ═════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═════════════════════════════════════════════════════════════════════

-- Trigger: Update updated_at on attribute_schema
CREATE OR REPLACE FUNCTION update_attribute_schema_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attribute_schema_updated_at
  BEFORE UPDATE ON attribute_schema
  FOR EACH ROW
  EXECUTE FUNCTION update_attribute_schema_updated_at();

-- Trigger: Validate attribute value against schema
CREATE OR REPLACE FUNCTION validate_attribute_value()
RETURNS TRIGGER AS $$
DECLARE
  v_schema RECORD;
  v_allowed_values jsonb;
BEGIN
  -- Get schema for this attribute
  SELECT * INTO v_schema
  FROM attribute_schema
  WHERE key = NEW.attribute_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attribute key "%" not found in schema', NEW.attribute_key;
  END IF;

  -- For enum types, validate against allowed_values
  IF v_schema.data_type = 'enum' THEN
    v_allowed_values := v_schema.allowed_values;

    IF v_allowed_values IS NOT NULL THEN
      -- Check if value exists in allowed_values array
      IF NOT (v_allowed_values ? NEW.attribute_value) THEN
        -- Value not found - could fuzzy match here or reject
        RAISE WARNING 'Attribute value "%" not in allowed values for key "%"',
          NEW.attribute_value, NEW.attribute_key;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_attribute_before_insert
  BEFORE INSERT ON experience_attributes
  FOR EACH ROW
  EXECUTE FUNCTION validate_attribute_value();

-- ═════════════════════════════════════════════════════════════════════
-- GRANTS
-- ═════════════════════════════════════════════════════════════════════

GRANT SELECT ON attribute_schema TO anon, authenticated;
GRANT SELECT ON experience_attributes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON experience_attributes TO authenticated;
GRANT SELECT ON attribute_suggestions TO anon, authenticated;
GRANT INSERT ON attribute_suggestions TO authenticated;
GRANT SELECT ON pattern_insights TO anon, authenticated;

-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═════════════════════════════════════════════════════════════════════

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Attribute System migration completed successfully';
  RAISE NOTICE 'Tables created: attribute_schema, experience_attributes, attribute_suggestions, pattern_insights';
  RAISE NOTICE 'Next step: Run seed script to populate attribute_schema';
END $$;
