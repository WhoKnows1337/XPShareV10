import { SubmitStore, Question as StoreQuestion } from '@/lib/stores/submitStore'
import {
  fetchQuestionsForCategory,
  mapLegacyCategoryToSlug,
  type QuestionForUI
} from '@/lib/api/questions'

export interface Question extends Omit<StoreQuestion, 'type'> {
  type: 'date' | 'location' | 'multiChoice' | 'emotionalTags' | 'text' | 'boolean' | 'slider'
  field: string // which extracted field this relates to
  currentValue?: string | string[] | boolean | number
  confidence?: number
  xpBonus?: number
  helpText?: string
  placeholder?: string
  sliderConfig?: { min: number; max: number; step: number; unit: string }
  mapsToAttribute?: string // Attribute key from attribute_schema
  isAISuggestion?: boolean // True if pre-filled from AI attribute extraction
}

const CONFIDENCE_THRESHOLD = 60 // Lowered from 80 to reduce unnecessary questions

/**
 * Category-specific question templates
 */
const CATEGORY_QUESTIONS: Record<string, Question[]> = {
  'UAP Sighting': [
    {
      id: 'uap_time',
      type: 'date',
      question: 'Wann genau hast du das gesehen?',
      field: 'date',
      required: true,
    },
    {
      id: 'uap_location',
      type: 'location',
      question: 'Wo befandest du dich zu diesem Zeitpunkt?',
      field: 'location',
      required: true,
    },
    {
      id: 'uap_shape',
      type: 'multiChoice',
      question: 'Welche Form hatte das Objekt?',
      field: 'shape',
      options: ['Rund/Kugel', 'Dreieckig', 'Zigarrenförmig', 'Lichtpunkt', 'Andere'],
      required: false,
    },
    {
      id: 'uap_witnesses',
      type: 'multiChoice',
      question: 'Warst du alleine oder mit anderen?',
      field: 'witnesses',
      options: ['Alleine', 'Mit 1-2 Personen', 'Mit 3-5 Personen', 'Mehr als 5 Personen'],
      required: false,
    },
  ],
  'Spiritual Experience': [
    {
      id: 'spiritual_time',
      type: 'date',
      question: 'Wann hat sich das ereignet?',
      field: 'date',
      required: true,
    },
    {
      id: 'spiritual_location',
      type: 'location',
      question: 'Wo warst du?',
      field: 'location',
      required: true,
    },
    {
      id: 'spiritual_practice',
      type: 'multiChoice',
      question: 'Warst du in einer spirituellen Praxis?',
      field: 'practice',
      options: ['Meditation', 'Gebet', 'Yoga', 'Nein', 'Andere'],
      required: false,
    },
    {
      id: 'spiritual_emotions',
      type: 'emotionalTags',
      question: 'Welche Gefühle hast du erlebt?',
      field: 'emotions',
      required: false,
    },
  ],
  'Synchronicity': [
    {
      id: 'sync_time',
      type: 'date',
      question: 'Wann ist das passiert?',
      field: 'date',
      required: true,
    },
    {
      id: 'sync_location',
      type: 'location',
      question: 'Wo warst du?',
      field: 'location',
      required: false,
    },
    {
      id: 'sync_frequency',
      type: 'multiChoice',
      question: 'Wie oft erlebst du solche Synchronizitäten?',
      field: 'frequency',
      options: ['Zum ersten Mal', 'Selten', 'Manchmal', 'Oft', 'Sehr häufig'],
      required: false,
    },
  ],
  'Paranormal': [
    {
      id: 'paranormal_time',
      type: 'date',
      question: 'Wann hat sich das ereignet?',
      field: 'date',
      required: true,
    },
    {
      id: 'paranormal_location',
      type: 'location',
      question: 'Wo warst du?',
      field: 'location',
      required: true,
    },
    {
      id: 'paranormal_type',
      type: 'multiChoice',
      question: 'Was für eine Art von Erfahrung war das?',
      field: 'type',
      options: ['Akustisch', 'Visuell', 'Physisch', 'Gefühl/Präsenz', 'Andere'],
      required: false,
    },
  ],
  'Dream/Vision': [
    {
      id: 'dream_time',
      type: 'date',
      question: 'Wann hattest du diesen Traum/diese Vision?',
      field: 'date',
      required: true,
    },
    {
      id: 'dream_type',
      type: 'multiChoice',
      question: 'War es ein Traum oder eine Vision im wachen Zustand?',
      field: 'type',
      options: ['Traum', 'Luzider Traum', 'Vision (wach)', 'Meditation/Trance'],
      required: false,
    },
    {
      id: 'dream_emotions',
      type: 'emotionalTags',
      question: 'Welche Gefühle waren dominant?',
      field: 'emotions',
      required: false,
    },
  ],
  'Consciousness': [
    {
      id: 'consciousness_time',
      type: 'date',
      question: 'Wann hast du das erlebt?',
      field: 'date',
      required: true,
    },
    {
      id: 'consciousness_trigger',
      type: 'multiChoice',
      question: 'Gab es einen Auslöser?',
      field: 'trigger',
      options: ['Meditation', 'Psychedelika', 'Spontan', 'Near-Death', 'Andere'],
      required: false,
    },
    {
      id: 'consciousness_duration',
      type: 'multiChoice',
      question: 'Wie lange hat die Erfahrung gedauert?',
      field: 'duration',
      options: ['Sekunden', 'Minuten', 'Stunden', 'Tage', 'Anhaltend'],
      required: false,
    },
  ],
  'Other': [
    {
      id: 'other_time',
      type: 'date',
      question: 'Wann ist das passiert?',
      field: 'date',
      required: true,
    },
    {
      id: 'other_location',
      type: 'location',
      question: 'Wo warst du?',
      field: 'location',
      required: false,
    },
  ],
}

/**
 * Determine if Screen 2 (Questions) should be shown
 */
export function shouldShowQuestions(extractedData: SubmitStore['extractedData']): boolean {
  const fields = [
    extractedData.title,
    extractedData.location,
    extractedData.date,
    extractedData.tags,
    extractedData.category,
  ]

  return fields.some((field) => (field.confidence || 0) < CONFIDENCE_THRESHOLD)
}

/**
 * Generate questions based on category and low-confidence fields (ASYNC - DB-driven)
 */
export async function generateQuestions(
  extractedData: SubmitStore['extractedData']
): Promise<Question[]> {
  const questions: Question[] = []

  // Step 1: Add low-confidence field questions FIRST
  if (extractedData.category.confidence < CONFIDENCE_THRESHOLD && !extractedData.category.isManuallyEdited) {
    questions.push({
      id: 'category_clarify',
      type: 'multiChoice',
      question: 'Welche Kategorie passt am besten zu deiner Erfahrung?',
      field: 'category',
      options: [
        'Himmelsphänomene & UAP',
        'Bewusstsein & Erwachen',
        'Paranormales & Geister',
        'PSI & Übersinnliches',
        'Wesen & Begegnungen',
        'Synchronizität & Zeichen',
        'Heilung & Energie',
        'Natur-Anomalien',
      ],
      required: true,
      currentValue: extractedData.category.value,
      confidence: extractedData.category.confidence,
      xpBonus: 0,
    })
  }

  if (extractedData.title.confidence < CONFIDENCE_THRESHOLD && !extractedData.title.isManuallyEdited) {
    questions.push({
      id: 'title_clarify',
      type: 'text',
      question: 'Wie würdest du deine Erfahrung in einem Satz zusammenfassen?',
      field: 'title',
      required: true,
      currentValue: extractedData.title.value,
      confidence: extractedData.title.confidence,
      xpBonus: 0,
      placeholder: 'z.B. "Ich sah ein unbekanntes Flugobjekt über Berlin"',
    })
  }

  // Step 2: Fetch category-specific questions from DB
  try {
    const category = extractedData.category.value || 'Other'
    const categorySlug = mapLegacyCategoryToSlug(category)
    const dbQuestions = await fetchQuestionsForCategory(categorySlug)

    // Step 3: Filter and add DB questions intelligently
    dbQuestions.forEach((dbQ) => {
      const question: Question = {
        id: dbQ.id,
        type: dbQ.type,
        question: dbQ.question,
        field: dbQ.field,
        options: dbQ.options,
        required: dbQ.required,
        xpBonus: dbQ.xpBonus,
        helpText: dbQ.helpText,
        placeholder: dbQ.placeholder,
        sliderConfig: dbQ.sliderConfig,
        mapsToAttribute: dbQ.mapsToAttribute,
      }

      // Check if question maps to an AI-extracted attribute
      if (dbQ.mapsToAttribute && extractedData.attributes[dbQ.mapsToAttribute]) {
        const attribute = extractedData.attributes[dbQ.mapsToAttribute]
        question.currentValue = attribute.value
        question.confidence = attribute.confidence
        question.isAISuggestion = !attribute.isManuallyEdited
        // Boost XP for confirming AI suggestions
        question.xpBonus = (question.xpBonus || 0) + 5
        questions.push(question)
      } else if (dbQ.field === 'date' && extractedData.date.value) {
        // Only ask date if confidence is low
        if (extractedData.date.confidence < CONFIDENCE_THRESHOLD) {
          question.currentValue = extractedData.date.value
          question.confidence = extractedData.date.confidence
          questions.push(question)
        } else if (!dbQ.required) {
          // Optional question, add anyway for XP bonus
          question.currentValue = extractedData.date.value
          question.confidence = extractedData.date.confidence
          questions.push(question)
        }
      } else if (dbQ.field === 'location' && extractedData.location.value) {
        // Only ask location if confidence is low
        if (extractedData.location.confidence < CONFIDENCE_THRESHOLD) {
          question.currentValue = extractedData.location.value
          question.confidence = extractedData.location.confidence
          questions.push(question)
        } else if (!dbQ.required) {
          // Optional question, add anyway for XP bonus
          question.currentValue = extractedData.location.value
          question.confidence = extractedData.location.confidence
          questions.push(question)
        }
      } else {
        // For all other questions, add if required OR if optional (for XP)
        if (dbQ.required) {
          questions.push(question)
        } else {
          // Optional questions: add for gamification
          questions.push(question)
        }
      }
    })
  } catch (error) {
    console.error('Error loading questions from DB, using fallback:', error)
    // Fallback to basic questions if DB fails
    const fallbackQuestions = getFallbackQuestions(extractedData)
    questions.push(...fallbackQuestions)
  }

  return questions
}

/**
 * Fallback questions if DB is unavailable
 */
function getFallbackQuestions(extractedData: SubmitStore['extractedData']): Question[] {
  const questions: Question[] = []

  if (extractedData.date.confidence < CONFIDENCE_THRESHOLD) {
    questions.push({
      id: 'date_fallback',
      type: 'date',
      question: 'Wann ist das passiert?',
      field: 'date',
      required: true,
      currentValue: extractedData.date.value,
      confidence: extractedData.date.confidence,
    })
  }

  if (extractedData.location.confidence < CONFIDENCE_THRESHOLD) {
    questions.push({
      id: 'location_fallback',
      type: 'text',
      question: 'Wo warst du?',
      field: 'location',
      required: true,
      currentValue: extractedData.location.value,
      confidence: extractedData.location.confidence,
      placeholder: 'z.B. Berlin, Deutschland',
    })
  }

  return questions
}

/**
 * Get emotion options for EmotionalTags component
 */
export const EMOTION_OPTIONS = [
  { emoji: '😊', label: 'Freude', value: 'joy' },
  { emoji: '😌', label: 'Frieden', value: 'peace' },
  { emoji: '😮', label: 'Staunen', value: 'awe' },
  { emoji: '😨', label: 'Angst', value: 'fear' },
  { emoji: '😢', label: 'Trauer', value: 'sadness' },
  { emoji: '😠', label: 'Wut', value: 'anger' },
  { emoji: '🤔', label: 'Verwirrung', value: 'confusion' },
  { emoji: '💫', label: 'Euphorie', value: 'euphoria' },
  { emoji: '🙏', label: 'Dankbarkeit', value: 'gratitude' },
  { emoji: '😰', label: 'Überwältigung', value: 'overwhelm' },
  { emoji: '✨', label: 'Klarheit', value: 'clarity' },
  { emoji: '❤️', label: 'Liebe', value: 'love' },
]
