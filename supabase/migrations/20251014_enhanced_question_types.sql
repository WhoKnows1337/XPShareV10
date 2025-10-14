-- =====================================================
-- Enhanced Question Types Migration
-- Adds support for new question types:
-- - dropdown, dropdown-multi (select dropdowns)
-- - image-select, image-multi (visual selections)
-- - rating (star ratings)
-- - color (color picker)
-- - range (min-max)
-- - ai-text (AI-powered extraction)
-- - textarea (long text)
-- =====================================================

-- Add comment documenting all supported question types
COMMENT ON COLUMN dynamic_questions.question_type IS
'Supported question types:
- chips: Single choice (radio buttons)
- chips-multi: Multiple choice (checkboxes)
- text: Short text input
- boolean: Yes/No question
- slider: Numeric slider
- date: Date picker
- time: Time picker
- dropdown: Single dropdown select
- dropdown-multi: Multi-select dropdown
- image-select: Select from images (single)
- image-multi: Select from images (multiple)
- rating: Star rating (1-5)
- color: Color picker
- range: Min-Max range
- ai-text: AI extracts attribute from free text
- textarea: Long text input';

-- No schema changes needed - question_type is already TEXT
-- The options column (JSONB) already supports extended properties like image_url

-- Example option formats:
-- Standard: {"value": "disc", "label": "Scheibe"}
-- With image: {"value": "disc", "label": "Scheibe", "image_url": "...", "image_id": "..."}
-- With color: {"value": "red", "label": "Rot", "color": "#ff0000"}
-- With description: {"value": "yes", "label": "Ja", "description": "Select if..."}

-- Update existing validation if any (optional - for future constraint)
-- ALTER TABLE dynamic_questions
-- ADD CONSTRAINT valid_question_type CHECK (
--   question_type IN (
--     'chips', 'chips-multi', 'text', 'boolean', 'slider', 'date', 'time',
--     'dropdown', 'dropdown-multi', 'image-select', 'image-multi',
--     'rating', 'color', 'range', 'ai-text', 'textarea'
--   )
-- );

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced question types migration completed successfully';
  RAISE NOTICE 'Added support for: dropdown, dropdown-multi, image-select, image-multi, rating, color, range, ai-text, textarea';
END $$;
