/**
 * Filter Persistence Utilities
 *
 * Saves and loads search filters to/from localStorage to persist user preferences
 * across sessions.
 */

const STORAGE_KEY = 'xpshare_search_filters_v1'

export interface PersistedFilters {
  categories?: string[]
  tags?: string[]
  location?: string
  dateFrom?: string
  dateTo?: string
  witnessesOnly?: boolean
}

/**
 * Save filters to localStorage
 */
export function saveFilters(filters: PersistedFilters): void {
  try {
    // Only save non-empty filters
    const filtersToSave: PersistedFilters = {}

    if (filters.categories && filters.categories.length > 0) filtersToSave.categories = filters.categories
    if (filters.tags && filters.tags.length > 0) filtersToSave.tags = filters.tags
    if (filters.location) filtersToSave.location = filters.location
    if (filters.dateFrom) filtersToSave.dateFrom = filters.dateFrom
    if (filters.dateTo) filtersToSave.dateTo = filters.dateTo
    if (filters.witnessesOnly) filtersToSave.witnessesOnly = filters.witnessesOnly

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtersToSave))
  } catch (error) {
    // Silent fail - localStorage might be disabled or full
    console.warn('Failed to save filters to localStorage:', error)
  }
}

/**
 * Load filters from localStorage
 */
export function loadFilters(): PersistedFilters {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return {}

    const parsed = JSON.parse(saved)

    // Validate structure
    if (typeof parsed !== 'object' || parsed === null) {
      return {}
    }

    return parsed as PersistedFilters
  } catch (error) {
    // Silent fail - corrupted data or parse error
    console.warn('Failed to load filters from localStorage:', error)
    return {}
  }
}

/**
 * Clear saved filters
 */
export function clearSavedFilters(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear filters from localStorage:', error)
  }
}

/**
 * Merge URL params with saved filters
 * URL params take precedence over saved filters
 */
export function mergeFilters(
  urlParams: PersistedFilters,
  savedFilters: PersistedFilters
): PersistedFilters {
  // For arrays, concatenate and deduplicate if both exist
  const mergedCategories = urlParams.categories && urlParams.categories.length > 0
    ? urlParams.categories
    : savedFilters.categories || []

  const mergedTags = urlParams.tags && urlParams.tags.length > 0
    ? urlParams.tags
    : savedFilters.tags || []

  return {
    categories: mergedCategories,
    tags: mergedTags,
    location: urlParams.location || savedFilters.location || '',
    dateFrom: urlParams.dateFrom || savedFilters.dateFrom || '',
    dateTo: urlParams.dateTo || savedFilters.dateTo || '',
    witnessesOnly: urlParams.witnessesOnly ?? savedFilters.witnessesOnly ?? false,
  }
}
