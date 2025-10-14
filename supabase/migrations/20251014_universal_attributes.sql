-- ═════════════════════════════════════════════════════════════════════
-- UNIVERSAL ATTRIBUTES (B+F Phase 1)
-- Migration: 20251014_universal_attributes
-- Description: Add universal attributes that apply to ALL categories
-- ═════════════════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════════════════
-- STEP 1: Add Universal Attributes to attribute_schema
-- ═════════════════════════════════════════════════════════════════════

-- These attributes apply to ALL experiences, regardless of category
-- category_slug = NULL means universal

INSERT INTO attribute_schema (
  key,
  display_name,
  display_name_de,
  category_slug,
  data_type,
  allowed_values,
  description,
  is_searchable,
  is_filterable,
  sort_order
) VALUES
  -- Event Date (ISO format: YYYY-MM-DD)
  (
    'event_date',
    'Event Date',
    'Datum',
    NULL,  -- Universal!
    'text',
    NULL,
    'The date when the experience occurred',
    true,
    true,
    1
  ),

  -- Event Time (24h format: HH:MM)
  (
    'event_time',
    'Event Time',
    'Uhrzeit',
    NULL,  -- Universal!
    'text',
    NULL,
    'The time when the experience occurred',
    true,
    true,
    2
  ),

  -- Event Location (free text or coordinates)
  (
    'event_location',
    'Event Location',
    'Ort',
    NULL,  -- Universal!
    'text',
    NULL,
    'Where the experience occurred',
    true,
    true,
    3
  ),

  -- Event Duration (enum with standard values)
  (
    'event_duration',
    'Event Duration',
    'Dauer',
    NULL,  -- Universal!
    'enum',
    '["less_than_1min", "1_to_5min", "more_than_5min"]'::jsonb,
    'How long the experience lasted',
    true,
    true,
    4
  )

ON CONFLICT (key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  display_name_de = EXCLUDED.display_name_de,
  data_type = EXCLUDED.data_type,
  allowed_values = EXCLUDED.allowed_values,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ═════════════════════════════════════════════════════════════════════
-- STEP 2: Add Universal Questions to dynamic_questions
-- ═════════════════════════════════════════════════════════════════════

-- These questions map to universal attributes
-- They will only be shown if AI didn't extract them (smart-filtering)

-- First, ensure we have a universal category placeholder or use NULL
-- For questions, category_id NULL means "applies to all categories"

INSERT INTO dynamic_questions (
  category_id,
  question_text,
  question_type,
  is_optional,
  priority,
  maps_to_attribute,
  help_text,
  placeholder
) VALUES
  -- Q1: Event Date (required, maps to event_date)
  (
    NULL,  -- Universal!
    'Wann ist das passiert?',
    'date',
    false,  -- Required
    1,      -- Highest priority
    'event_date',
    'Das genaue Datum hilft bei der Mustererkennung',
    NULL
  ),

  -- Q2: Event Location (required, maps to event_location)
  (
    NULL,  -- Universal!
    'Wo ist das passiert?',
    'text',
    false,  -- Required
    3,
    'event_location',
    'Stadt, Land oder genauere Ortsangabe',
    'Berlin, Germany'
  ),

  -- Q3: Event Duration (required, maps to event_duration)
  (
    NULL,  -- Universal!
    'Wie lange dauerte es?',
    'chips',
    false,  -- Required
    4,
    'event_duration',
    'Ungefähre Dauer der Erfahrung',
    NULL
  )

ON CONFLICT DO NOTHING;  -- Skip if already exists

-- Add options for duration question
-- Note: We need to find the question_id first, then add options
-- This is a bit tricky with ON CONFLICT DO NOTHING, so we'll use a DO block

DO $$
DECLARE
  v_duration_question_id uuid;
BEGIN
  -- Find the duration question
  SELECT id INTO v_duration_question_id
  FROM dynamic_questions
  WHERE maps_to_attribute = 'event_duration'
  LIMIT 1;

  -- Update options if question exists
  IF v_duration_question_id IS NOT NULL THEN
    UPDATE dynamic_questions
    SET options = jsonb_build_array(
      jsonb_build_object('value', 'less_than_1min', 'label', 'Unter 1 Minute'),
      jsonb_build_object('value', '1_to_5min', 'label', '1-5 Minuten'),
      jsonb_build_object('value', 'more_than_5min', 'label', 'Mehr als 5 Minuten')
    )
    WHERE id = v_duration_question_id;
  END IF;
END $$;

-- ═════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_universal_attrs_count int;
  v_universal_questions_count int;
BEGIN
  -- Count universal attributes
  SELECT COUNT(*) INTO v_universal_attrs_count
  FROM attribute_schema
  WHERE category_slug IS NULL;

  -- Count universal questions
  SELECT COUNT(*) INTO v_universal_questions_count
  FROM dynamic_questions
  WHERE category_id IS NULL;

  RAISE NOTICE '✅ Universal Attributes created: %', v_universal_attrs_count;
  RAISE NOTICE '✅ Universal Questions created: %', v_universal_questions_count;

  IF v_universal_attrs_count >= 4 AND v_universal_questions_count >= 3 THEN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Next: Update /api/submit/analyze-complete to load Universal + Category attributes';
  ELSE
    RAISE WARNING '⚠️  Expected at least 4 attributes and 3 questions, got % attributes and % questions',
      v_universal_attrs_count, v_universal_questions_count;
  END IF;
END $$;
