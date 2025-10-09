import { SubmitStore, Question as StoreQuestion } from '@/lib/stores/submitStore'

export interface Question extends Omit<StoreQuestion, 'type'> {
  type: 'date' | 'location' | 'multiChoice' | 'emotionalTags' | 'text'
  field: string // which extracted field this relates to
  currentValue?: string | string[]
  confidence?: number
}

const CONFIDENCE_THRESHOLD = 80

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
 * Generate questions based on category and low-confidence fields
 */
export function generateQuestions(
  extractedData: SubmitStore['extractedData']
): Question[] {
  const category = extractedData.category.value || 'Other'
  const categoryQuestions = CATEGORY_QUESTIONS[category] || CATEGORY_QUESTIONS['Other']

  const questions: Question[] = []

  // Always add category-specific questions
  categoryQuestions.forEach((q) => {
    const questionCopy = { ...q }

    // If this question relates to an extracted field, add current value and confidence
    if (q.field === 'date' && extractedData.date.value) {
      questionCopy.currentValue = extractedData.date.value
      questionCopy.confidence = extractedData.date.confidence
    } else if (q.field === 'location' && extractedData.location.value) {
      questionCopy.currentValue = extractedData.location.value
      questionCopy.confidence = extractedData.location.confidence
    }

    questions.push(questionCopy)
  })

  // Add low-confidence field questions
  if (extractedData.title.confidence < CONFIDENCE_THRESHOLD && !extractedData.title.isManuallyEdited) {
    questions.unshift({
      id: 'title_clarify',
      type: 'text',
      question: 'Wie würdest du deine Erfahrung in einem Satz zusammenfassen?',
      field: 'title',
      required: true,
      currentValue: extractedData.title.value,
      confidence: extractedData.title.confidence,
    })
  }

  if (extractedData.category.confidence < CONFIDENCE_THRESHOLD && !extractedData.category.isManuallyEdited) {
    questions.unshift({
      id: 'category_clarify',
      type: 'multiChoice',
      question: 'Welche Kategorie passt am besten?',
      field: 'category',
      options: [
        'UAP Sighting',
        'Spiritual Experience',
        'Synchronicity',
        'Paranormal',
        'Dream/Vision',
        'Consciousness',
        'Other',
      ],
      required: true,
      currentValue: extractedData.category.value,
      confidence: extractedData.category.confidence,
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
