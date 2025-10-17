/**
 * Intent Detection for Unified Search
 * Automatically detects if query is natural language, keyword, or question
 */

export interface QueryIntent {
  isNaturalLanguage: boolean
  isQuestion: boolean
  isKeyword: boolean
  confidence: number
  suggestedMode: 'search' | 'ask'
  detectedConcepts?: string[]
  vectorWeight: number // For RRF dynamic weighting
  ftsWeight: number
}

const NLP_INDICATORS = [
  'experiences? with',
  'looking for',
  'tell me about',
  'what are',
  'how do',
  'why do',
  'stories about',
  'can you find',
  'show me',
  'i want to',
  'help me find',
]

const QUESTION_STARTERS = [
  'what',
  'how',
  'why',
  'when',
  'where',
  'who',
  'which',
  'is there',
  'are there',
  'can',
  'could',
  'would',
  'should',
]

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  ufo: ['ufo', 'alien', 'spacecraft', 'flying object', 'orb', 'light in sky'],
  paranormal: ['ghost', 'paranormal', 'haunted', 'spirit', 'entity'],
  dreams: ['dream', 'lucid', 'nightmare', 'sleeping', 'rem'],
  psychedelic: ['psychedelic', 'trip', 'lsd', 'mushroom', 'dmt', 'ayahuasca'],
  spiritual: ['spiritual', 'meditation', 'awakening', 'consciousness', 'enlightenment'],
  synchronicity: ['synchronicity', 'coincidence', 'meaningful', 'serendipity'],
  nde: ['near-death', 'nde', 'died', 'clinical death', 'out of body', 'obe'],
}

/**
 * Detects the intent of a search query
 */
export async function detectQueryIntent(query: string): Promise<QueryIntent> {
  if (!query || query.trim().length === 0) {
    return {
      isNaturalLanguage: false,
      isQuestion: false,
      isKeyword: true,
      confidence: 0,
      suggestedMode: 'search',
      vectorWeight: 0.6,
      ftsWeight: 0.4,
    }
  }

  const normalizedQuery = query.toLowerCase().trim()
  const wordCount = normalizedQuery.split(/\s+/).length
  const hasQuestionMark = query.includes('?')

  // Check for question indicators
  const startsWithQuestion = QUESTION_STARTERS.some((starter) =>
    normalizedQuery.startsWith(starter + ' ')
  )

  const isQuestion = hasQuestionMark || startsWithQuestion

  // Check for NLP indicators
  const hasNLPPhrases = NLP_INDICATORS.some((phrase) => {
    const regex = new RegExp(phrase, 'i')
    return regex.test(normalizedQuery)
  })

  // Detect if it's a natural language query
  const isLongQuery = wordCount > 5
  const hasMultipleSentences = query.split(/[.!?]/).length > 1
  const hasCommonWords = /\b(the|a|an|in|on|at|to|for|of|with)\b/i.test(
    normalizedQuery
  )

  const naturalLanguageScore =
    (isLongQuery ? 0.3 : 0) +
    (hasNLPPhrases ? 0.4 : 0) +
    (hasMultipleSentences ? 0.2 : 0) +
    (hasCommonWords ? 0.1 : 0)

  const isNaturalLanguage = naturalLanguageScore > 0.5 || isQuestion

  // Keywords are typically short, specific terms
  const isKeyword = wordCount <= 3 && !isQuestion && !hasNLPPhrases

  // Calculate confidence
  let confidence = 0.5
  if (isKeyword) confidence = 0.9
  if (isNaturalLanguage && !isQuestion) confidence = 0.7
  if (isQuestion) confidence = 0.95

  // Extract concepts (detect categories)
  const detectedConcepts: string[] = []
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    const found = keywords.some((keyword) => normalizedQuery.includes(keyword))
    if (found) {
      detectedConcepts.push(category)
    }
  })

  // Suggest mode
  const suggestedMode: 'search' | 'ask' =
    isQuestion && hasQuestionMark ? 'ask' : 'search'

  // Dynamic RRF weighting based on intent
  let vectorWeight = 0.6 // Default
  let ftsWeight = 0.4

  if (isNaturalLanguage) {
    // NLP queries benefit from vector search
    vectorWeight = 0.8
    ftsWeight = 0.2
  } else if (isKeyword) {
    // Keyword queries benefit from FTS
    vectorWeight = 0.3
    ftsWeight = 0.7
  }

  return {
    isNaturalLanguage,
    isQuestion,
    isKeyword,
    confidence,
    suggestedMode,
    detectedConcepts: detectedConcepts.length > 0 ? detectedConcepts : undefined,
    vectorWeight,
    ftsWeight,
  }
}

/**
 * Generates a user-friendly feedback message based on intent
 */
export function getIntentFeedback(intent: QueryIntent, query: string): string {
  if (intent.isQuestion) {
    return `💬 This looks like a question. Try Ask mode for AI-generated answers!`
  }

  if (intent.isNaturalLanguage && intent.detectedConcepts) {
    const concepts = intent.detectedConcepts.join(', ')
    return `🧠 Understanding: ${concepts} experiences`
  }

  if (intent.isNaturalLanguage) {
    return `✨ Finding semantically similar experiences...`
  }

  if (intent.isKeyword) {
    return `🔍 Searching for: "${query}"`
  }

  return `✨ Finding relevant experiences...`
}

/**
 * Returns appropriate icon for intent
 */
export function getIntentIcon(intent: QueryIntent): string {
  if (intent.isQuestion) return '💬'
  if (intent.isNaturalLanguage) return '🧠'
  if (intent.isKeyword) return '🔍'
  return '✨'
}

/**
 * Returns color class for search bar based on intent
 */
export function getIntentColorClass(intent: QueryIntent): string {
  if (intent.isQuestion) return 'border-green-500'
  if (intent.isNaturalLanguage) return 'border-purple-500'
  if (intent.isKeyword) return 'border-blue-500'
  return 'border-gray-300'
}
