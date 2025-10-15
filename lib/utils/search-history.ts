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
