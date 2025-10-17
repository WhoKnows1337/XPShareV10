/**
 * Fuzzy Search Utilities
 * 
 * Provides typo handling and "Did you mean?" suggestions
 * Uses Levenshtein distance for similarity matching
 */

// Calculate Levenshtein distance between two strings
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

// Calculate similarity score (0-1, where 1 is identical)
export function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  const maxLength = Math.max(str1.length, str2.length)
  return 1 - distance / maxLength
}

// Common search terms and their variations
const commonTerms = [
  { term: 'UFO', variations: ['ufo', 'uap', 'flying saucer', 'unidentified'] },
  { term: 'psychedelic', variations: ['psychadelic', 'psycedelic', 'hallucinogen'] },
  { term: 'ayahuasca', variations: ['ayahuaska', 'ayawaska', 'yage'] },
  { term: 'meditation', variations: ['mediation', 'meditate'] },
  { term: 'lucid dream', variations: ['lucid dreem', 'conscous dream'] },
  { term: 'paranormal', variations: ['para normal', 'supernatural'] },
  { term: 'synchronicity', variations: ['syncronicity', 'meaningful coincidence'] },
  { term: 'near-death', variations: ['near death', 'NDE', 'life after death'] },
]

// Get "Did you mean?" suggestion
export function getDidYouMeanSuggestion(query: string): string | null {
  const lowerQuery = query.toLowerCase().trim()
  
  if (lowerQuery.length < 3) return null

  let bestMatch: { term: string; score: number } | null = null

  for (const { term, variations } of commonTerms) {
    // Check similarity with main term
    const mainScore = similarityScore(lowerQuery, term.toLowerCase())
    
    if (mainScore > 0.6 && (!bestMatch || mainScore > bestMatch.score)) {
      bestMatch = { term, score: mainScore }
    }

    // Check similarity with variations
    for (const variation of variations) {
      const varScore = similarityScore(lowerQuery, variation)
      
      if (varScore > 0.7 && (!bestMatch || varScore > bestMatch.score)) {
        bestMatch = { term, score: varScore }
      }
    }
  }

  // Only suggest if score is high enough and not identical to original
  if (bestMatch && bestMatch.score < 0.95 && bestMatch.term.toLowerCase() !== lowerQuery) {
    return bestMatch.term
  }

  return null
}

// Check if query might have typos
export function hasLikelyTypos(query: string): boolean {
  const suggestion = getDidYouMeanSuggestion(query)
  return suggestion !== null
}

// Get multiple suggestions for a query
export function getFuzzySuggestions(
  query: string, 
  dictionary: string[], 
  maxSuggestions = 3
): string[] {
  const lowerQuery = query.toLowerCase()
  
  const scored = dictionary
    .map(term => ({
      term,
      score: similarityScore(lowerQuery, term.toLowerCase()),
    }))
    .filter(({ score, term }) => score > 0.6 && term.toLowerCase() !== lowerQuery)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)

  return scored.map(s => s.term)
}
