/**
 * Keyword Extraction for Hybrid Search
 *
 * Extracts meaningful keywords from user questions to enhance
 * vector search with structured attribute filtering.
 */

import natural from 'natural'

/**
 * Common words to ignore (stop words)
 */
const STOP_WORDS = new Set([
  'der', 'die', 'das', 'ein', 'eine', 'einen', 'einem',
  'ist', 'sind', 'war', 'waren', 'hat', 'haben',
  'gibt', 'es', 'über', 'von', 'zu', 'in', 'mit',
  'und', 'oder', 'aber', 'wenn', 'dann',
  'the', 'a', 'an', 'is', 'are', 'was', 'were',
  'has', 'have', 'there', 'about', 'of', 'to', 'in', 'with',
  'and', 'or', 'but', 'if', 'then',
  'einen', 'traum', 'dream', 'erfahrung', 'experience',
  'gibt', 'es', 'häufige', 'muster', 'pattern', 'patterns'
])

/**
 * Translations for common keywords (DE <-> EN)
 */
const KEYWORD_TRANSLATIONS: Record<string, string[]> = {
  'delfin': ['delfin', 'delfine', 'dolphin', 'dolphins'],
  'dolphin': ['delfin', 'delfine', 'dolphin', 'dolphins'],
  'vogel': ['vogel', 'vögel', 'bird', 'birds'],
  'bird': ['vogel', 'vögel', 'bird', 'birds'],
  'ufo': ['ufo', 'ufos', 'uap', 'uaps'],
  'geist': ['geist', 'geister', 'ghost', 'ghosts'],
  'ghost': ['geist', 'geister', 'ghost', 'ghosts'],
  'prophetisch': ['prophetisch', 'prophetic', 'voraussagend', 'precognitive'],
  'prophetic': ['prophetisch', 'prophetic', 'voraussagend', 'precognitive'],
  'luzid': ['luzid', 'lucid', 'klar', 'bewusst'],
  'lucid': ['luzid', 'lucid', 'klar', 'bewusst']
}

/**
 * Extract meaningful keywords from a question
 * Returns both original keywords and their translations
 */
export function extractKeywords(question: string): string[] {
  if (!question || question.trim().length === 0) {
    return []
  }

  // Normalize: lowercase, remove special chars
  const normalized = question
    .toLowerCase()
    .replace(/[^\w\säüöß]/g, ' ')
    .trim()

  // Split into words
  const words = normalized.split(/\s+/)

  // Filter meaningful words (length >= 3, not stop words)
  // ✅ FIX #1: Changed from > 3 to >= 3 to allow 3-letter acronyms like "UFO"
  const keywords = words.filter(word =>
    word.length >= 3 &&
    !STOP_WORDS.has(word)
  )

  // ✅ FIX #2: Apply German stemming for better matching
  // "vögeln" → "vogel", "träume" → "traum"
  const stemmer = natural.PorterStemmerDe

  const stemmedKeywords = keywords.map(word => {
    try {
      return stemmer.stem(word)
    } catch {
      return word // Fallback if stemming fails
    }
  })

  // Expand with translations
  const expandedKeywords = new Set<string>()
  stemmedKeywords.forEach(keyword => {
    expandedKeywords.add(keyword)

    // Add translations if available
    if (KEYWORD_TRANSLATIONS[keyword]) {
      KEYWORD_TRANSLATIONS[keyword].forEach(translation => {
        expandedKeywords.add(translation)
      })
    }
  })

  return Array.from(expandedKeywords)
}

/**
 * Extract tags from keywords
 * Maps keywords to common tag patterns
 */
export function keywordsToTags(keywords: string[]): string[] {
  const tags = new Set<string>()

  keywords.forEach(keyword => {
    // Add keyword itself as tag
    tags.add(keyword)

    // Add known translations
    if (KEYWORD_TRANSLATIONS[keyword]) {
      KEYWORD_TRANSLATIONS[keyword].forEach(tag => tags.add(tag))
    }
  })

  return Array.from(tags)
}
