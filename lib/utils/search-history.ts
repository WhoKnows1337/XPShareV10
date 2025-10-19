/**
 * Search History Utility
 *
 * Manages search history in localStorage with optional database sync for logged-in users
 */

export interface SearchHistoryItem {
  id: string
  query: string
  searchType: 'hybrid' | 'nlp' | 'ask' | 'advanced'
  filters?: {
    language?: string
    category?: string
    vectorWeight?: number
    crossLingual?: boolean
  }
  timestamp: string
  resultCount?: number
}

const STORAGE_KEY = 'xpshare_search_history'
const MAX_HISTORY_ITEMS = 100
const MAX_RECENT_ITEMS = 10

/**
 * Get all search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const history = JSON.parse(stored) as SearchHistoryItem[]
    return history.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    console.error('Failed to load search history:', error)
    return []
  }
}

/**
 * Get recent searches (limited to MAX_RECENT_ITEMS)
 */
export function getRecentSearches(limit: number = MAX_RECENT_ITEMS): SearchHistoryItem[] {
  return getSearchHistory().slice(0, limit)
}

/**
 * Add a new search to history
 */
export function addToSearchHistory(
  query: string,
  searchType: 'hybrid' | 'nlp' | 'ask' | 'advanced',
  filters?: SearchHistoryItem['filters'],
  resultCount?: number
): SearchHistoryItem {
  if (typeof window === 'undefined') {
    throw new Error('Cannot add to search history on server')
  }

  // Don't save empty queries
  if (!query.trim()) {
    throw new Error('Cannot save empty query to history')
  }

  const history = getSearchHistory()

  // Check if this exact search already exists (deduplicate)
  const existingIndex = history.findIndex(
    item =>
      item.query === query &&
      item.searchType === searchType &&
      JSON.stringify(item.filters) === JSON.stringify(filters)
  )

  let newItem: SearchHistoryItem

  if (existingIndex !== -1) {
    // Update existing item's timestamp and move to top
    newItem = {
      ...history[existingIndex],
      timestamp: new Date().toISOString(),
      resultCount,
    }
    history.splice(existingIndex, 1)
  } else {
    // Create new item
    newItem = {
      id: crypto.randomUUID(),
      query,
      searchType,
      filters,
      timestamp: new Date().toISOString(),
      resultCount,
    }
  }

  // Add to front of history
  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS)

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error('Failed to save search history:', error)
  }

  // Update popular queries tracking (Search 5.0)
  updatePopularQueries(query, resultCount)

  return newItem
}

/**
 * Remove a specific item from history
 */
export function removeFromSearchHistory(id: string): void {
  if (typeof window === 'undefined') return

  const history = getSearchHistory()
  const filtered = history.filter(item => item.id !== id)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove from search history:', error)
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear search history:', error)
  }
}

/**
 * Search within history
 */
export function searchInHistory(searchQuery: string): SearchHistoryItem[] {
  const history = getSearchHistory()
  const lowerQuery = searchQuery.toLowerCase()

  return history.filter(item =>
    item.query.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get search history grouped by date
 */
export function getHistoryGroupedByDate(): Record<string, SearchHistoryItem[]> {
  const history = getSearchHistory()
  const grouped: Record<string, SearchHistoryItem[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const thisWeek = new Date(today)
  thisWeek.setDate(thisWeek.getDate() - 7)
  const thisMonth = new Date(today)
  thisMonth.setDate(thisMonth.getDate() - 30)

  history.forEach(item => {
    const itemDate = new Date(item.timestamp)

    if (itemDate >= today) {
      grouped.today.push(item)
    } else if (itemDate >= yesterday) {
      grouped.yesterday.push(item)
    } else if (itemDate >= thisWeek) {
      grouped.thisWeek.push(item)
    } else if (itemDate >= thisMonth) {
      grouped.thisMonth.push(item)
    } else {
      grouped.older.push(item)
    }
  })

  return grouped
}

/**
 * Export search history as JSON
 */
export function exportSearchHistory(): string {
  const history = getSearchHistory()
  return JSON.stringify(history, null, 2)
}

/**
 * Import search history from JSON
 */
export function importSearchHistory(jsonData: string): void {
  if (typeof window === 'undefined') return

  try {
    const imported = JSON.parse(jsonData) as SearchHistoryItem[]

    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid history format')
    }

    // Merge with existing history (keeping most recent)
    const existing = getSearchHistory()
    const merged = [...imported, ...existing]

    // Deduplicate by ID
    const uniqueMap = new Map<string, SearchHistoryItem>()
    merged.forEach(item => uniqueMap.set(item.id, item))

    const unique = Array.from(uniqueMap.values())
      .sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, MAX_HISTORY_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique))
  } catch (error) {
    console.error('Failed to import search history:', error)
    throw new Error('Invalid search history file')
  }
}

// ============================================================================
// SEARCH 5.0: Popular Queries & Autocomplete Support
// ============================================================================

/**
 * Query frequency data for popular query tracking
 */
export interface QueryFrequency {
  query: string
  count: number
  lastUsed: string
  averageResults: number
}

const POPULAR_QUERIES_KEY = 'xpshare_popular_queries'
const MAX_POPULAR_QUERIES = 50

/**
 * Get popular queries based on frequency
 * Used for autocomplete suggestions in SmartSearchInput
 *
 * @param limit - Maximum number of queries to return (default: 10)
 * @param searchType - Filter by search type (optional)
 * @returns Array of popular query strings sorted by frequency
 */
export function getPopularQueries(
  limit: number = 10,
  searchType?: 'hybrid' | 'nlp' | 'ask' | 'advanced'
): string[] {
  if (typeof window === 'undefined') return []

  try {
    const frequencies = getQueryFrequencies()

    // Filter by search type if specified
    let filtered = frequencies
    if (searchType) {
      const history = getSearchHistory()
      const typeQueries = new Set(
        history.filter(h => h.searchType === searchType).map(h => h.query)
      )
      filtered = frequencies.filter(f => typeQueries.has(f.query))
    }

    return filtered
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(f => f.query)
  } catch (error) {
    console.error('Failed to get popular queries:', error)
    return []
  }
}

/**
 * Get query frequency data for analytics
 */
export function getQueryFrequencies(): QueryFrequency[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(POPULAR_QUERIES_KEY)
    if (!stored) {
      // Initialize from existing history
      return calculateQueryFrequencies()
    }

    return JSON.parse(stored) as QueryFrequency[]
  } catch (error) {
    console.error('Failed to load query frequencies:', error)
    return []
  }
}

/**
 * Calculate query frequencies from search history
 * Called automatically when popular queries data is missing
 */
function calculateQueryFrequencies(): QueryFrequency[] {
  const history = getSearchHistory()
  const frequencyMap = new Map<string, QueryFrequency>()

  history.forEach(item => {
    const normalized = item.query.trim().toLowerCase()
    if (!normalized) return

    const existing = frequencyMap.get(normalized)
    if (existing) {
      existing.count++
      existing.lastUsed = item.timestamp
      if (item.resultCount !== undefined) {
        existing.averageResults =
          (existing.averageResults * (existing.count - 1) + item.resultCount) / existing.count
      }
    } else {
      frequencyMap.set(normalized, {
        query: item.query, // Keep original casing
        count: 1,
        lastUsed: item.timestamp,
        averageResults: item.resultCount || 0
      })
    }
  })

  const frequencies = Array.from(frequencyMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_POPULAR_QUERIES)

  // Save for future use
  try {
    localStorage.setItem(POPULAR_QUERIES_KEY, JSON.stringify(frequencies))
  } catch (error) {
    console.error('Failed to save query frequencies:', error)
  }

  return frequencies
}

/**
 * Update popular queries tracking after a search
 * Should be called by addToSearchHistory automatically
 *
 * @param query - Search query
 * @param resultCount - Number of results found
 */
export function updatePopularQueries(query: string, resultCount: number = 0): void {
  if (typeof window === 'undefined') return

  const normalized = query.trim().toLowerCase()
  if (!normalized) return

  const frequencies = getQueryFrequencies()
  const existingIndex = frequencies.findIndex(
    f => f.query.toLowerCase() === normalized
  )

  if (existingIndex !== -1) {
    // Update existing query
    const existing = frequencies[existingIndex]
    existing.count++
    existing.lastUsed = new Date().toISOString()
    existing.averageResults =
      (existing.averageResults * (existing.count - 1) + resultCount) / existing.count
  } else {
    // Add new query
    frequencies.push({
      query,
      count: 1,
      lastUsed: new Date().toISOString(),
      averageResults: resultCount
    })
  }

  // Sort and trim
  const sorted = frequencies
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_POPULAR_QUERIES)

  try {
    localStorage.setItem(POPULAR_QUERIES_KEY, JSON.stringify(sorted))
  } catch (error) {
    console.error('Failed to update popular queries:', error)
  }
}

/**
 * Get autocomplete suggestions based on partial query
 * Combines popular queries with history for better UX
 *
 * @param partial - Partial query string (min 3 chars)
 * @param limit - Max suggestions to return (default: 5)
 * @returns Array of matching query suggestions
 */
export function getAutocompleteSuggestions(
  partial: string,
  limit: number = 5
): string[] {
  if (typeof window === 'undefined') return []
  if (partial.length < 3) return []

  const normalized = partial.toLowerCase().trim()
  const popular = getPopularQueries(20) // Get top 20 popular
  const recent = getRecentSearches(10).map(h => h.query)

  // Combine and deduplicate
  const allQueries = [...new Set([...popular, ...recent])]

  // Filter by partial match
  const matches = allQueries
    .filter(q => q.toLowerCase().includes(normalized))
    .slice(0, limit)

  return matches
}

/**
 * Clear popular queries cache
 * Useful for testing or when data becomes stale
 */
export function clearPopularQueries(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(POPULAR_QUERIES_KEY)
  } catch (error) {
    console.error('Failed to clear popular queries:', error)
  }
}
