import { createClient } from '@/lib/supabase/client'

// ============================================
// Type Definitions
// ============================================

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  emoji: string
  color: string
  sort_order: number
  is_active: boolean
}

export interface DynamicQuestion {
  id: string
  category_id: string
  question_text: string
  question_type: 'chips' | 'chips-multi' | 'text' | 'boolean' | 'slider' | 'date' | 'time'
  options: string[] | { min: number; max: number; step: number; unit: string }
  priority: number
  is_optional: boolean
  help_text: string | null
  placeholder: string | null
  conditional_logic: Record<string, any>
  ai_adaptive: boolean
  maps_to_attribute: string | null
}

export interface QuestionForUI {
  id: string
  question: string
  type: 'date' | 'location' | 'multiChoice' | 'emotionalTags' | 'text' | 'boolean' | 'slider'
  field: string
  options?: string[]
  sliderConfig?: { min: number; max: number; step: number; unit: string }
  required: boolean
  helpText?: string
  placeholder?: string
  xpBonus: number
  mapsToAttribute?: string // Links to attribute_schema key
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch all active categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('question_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return (data as Category[]) || []
}

/**
 * Fetch category by slug
 */
export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('question_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data as Category
}

/**
 * Map old category names to new slugs
 */
export function mapLegacyCategoryToSlug(legacyCategory: string): string {
  const mapping: Record<string, string> = {
    'UAP Sighting': 'sky-phenomena',
    'UFO': 'sky-phenomena',
    'Spiritual Experience': 'consciousness',
    'Synchronicity': 'synchronicity',
    'Paranormal': 'paranormal',
    'Dream/Vision': 'consciousness',
    'Consciousness': 'consciousness',
    'Other': 'synchronicity', // Default fallback
  }

  return mapping[legacyCategory] || 'synchronicity'
}

/**
 * Fetch questions for a specific category
 */
export async function fetchQuestionsForCategory(categorySlug: string): Promise<QuestionForUI[]> {
  const supabase = createClient()

  // First get category ID
  const category = await fetchCategoryBySlug(categorySlug)
  if (!category) {
    console.error('Category not found:', categorySlug)
    return []
  }

  const { data, error } = await supabase
    .from('dynamic_questions')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('priority', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  // Map to UI format
  return ((data as DynamicQuestion[]) || []).map(mapQuestionToUI)
}

/**
 * Map database question to UI question format
 */
function mapQuestionToUI(dbQuestion: DynamicQuestion): QuestionForUI {
  const typeMapping: Record<string, QuestionForUI['type']> = {
    'date': 'date',
    'text': 'text',
    'chips': 'multiChoice',
    'chips-multi': 'multiChoice',
    'boolean': 'boolean',
    'slider': 'slider',
  }

  const question: QuestionForUI = {
    id: dbQuestion.id,
    question: dbQuestion.question_text,
    type: typeMapping[dbQuestion.question_type] || 'text',
    field: generateFieldName(dbQuestion.question_text),
    required: !dbQuestion.is_optional,
    xpBonus: dbQuestion.is_optional ? 5 : 0,
  }

  // Add options for multiChoice
  if (dbQuestion.question_type === 'chips' || dbQuestion.question_type === 'chips-multi') {
    question.options = Array.isArray(dbQuestion.options) ? dbQuestion.options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.label || opt.value
    ) : []
  }

  // Add slider config - handle both old and new format
  if (dbQuestion.question_type === 'slider') {
    if (Array.isArray(dbQuestion.options)) {
      // New format: [{value: '__slider_config__', label: JSON.stringify(config)}]
      const configOption: any = dbQuestion.options.find((opt: any) => opt.value === '__slider_config__')
      if (configOption && configOption.label) {
        try {
          question.sliderConfig = JSON.parse(configOption.label)
        } catch {
          question.sliderConfig = { min: 0, max: 100, step: 1, unit: '%' }
        }
      } else {
        // Fallback
        question.sliderConfig = { min: 0, max: 100, step: 1, unit: '%' }
      }
    } else if (typeof dbQuestion.options === 'object') {
      // Direct object format (if stored directly)
      question.sliderConfig = dbQuestion.options as any
    } else {
      question.sliderConfig = { min: 0, max: 100, step: 1, unit: '%' }
    }
  }

  // Add help text and placeholder
  if (dbQuestion.help_text) {
    question.helpText = dbQuestion.help_text
  }

  if (dbQuestion.placeholder) {
    question.placeholder = dbQuestion.placeholder
  }

  // Add attribute mapping
  if (dbQuestion.maps_to_attribute) {
    question.mapsToAttribute = dbQuestion.maps_to_attribute
  }

  return question
}

/**
 * Generate a field name from question text (for backward compatibility)
 */
function generateFieldName(questionText: string): string {
  const fieldMapping: Record<string, string> = {
    'Wann': 'date',
    'Wo': 'location',
    'Form': 'shape',
    'Wie lange': 'duration',
    'alleine': 'witnesses',
    'Art von Erfahrung': 'type',
    'Auslöser': 'trigger',
    'Gefühle': 'emotions',
    'Zeugen': 'witnesses',
    'wiederholt': 'frequency',
    'PSI-Phänomen': 'psi_type',
    'Wesen': 'entity_type',
    'Kommunikation': 'communication',
    'Synchronizität': 'sync_type',
    'Heilung': 'healing_type',
    'Anomalie': 'anomaly_type',
  }

  for (const [key, value] of Object.entries(fieldMapping)) {
    if (questionText.includes(key)) {
      return value
    }
  }

  // Default: sanitize question text
  return questionText
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 30)
}

/**
 * Save answers to database
 */
export async function saveExperienceAnswers(
  experienceId: string,
  answers: Record<string, any>
): Promise<boolean> {
  const supabase = createClient()

  // Convert answers to array format for experience_answers table
  const answerRecords = Object.entries(answers).map(([questionId, answerValue]) => ({
    experience_id: experienceId,
    question_id: questionId,
    answer_value: answerValue,
  }))

  const { error } = await supabase
    .from('experience_answers')
    .insert(answerRecords)

  if (error) {
    console.error('Error saving answers:', error)
    return false
  }

  return true
}

/**
 * Calculate XP for answered questions
 */
export function calculateQuestionXP(questions: QuestionForUI[], answers: Record<string, any>): number {
  let totalXP = 0

  questions.forEach((q) => {
    if (answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null) {
      totalXP += q.xpBonus
    }
  })

  return totalXP
}
