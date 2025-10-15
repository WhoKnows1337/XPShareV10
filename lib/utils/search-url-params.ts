/**
 * Search URL Parameter Serialization/Deserialization
 *
 * Enables:
 * - Shareable search URLs with all filters
 * - Browser back/forward navigation
 * - Bookmarkable searches
 * - Deep linking to search states
 */

export interface SearchFilters {
  // Basic Search
  query?: string
  searchMode?: 'hybrid' | 'nlp' | 'ask' | 'advanced'
  category?: string

  // Hybrid Search Options
  language?: 'de' | 'en' | 'fr' | 'es'
  vectorWeight?: number
  crossLingual?: boolean

  // Advanced Filters
  dateRange?: {
    from?: Date
    to?: Date
  }
  witnessCount?: {
    min?: number
    max?: number
  }
  mediaTypes?: string[]
  location?: {
    lat?: number
    lng?: number
    radius?: number
  }
  duration?: {
    min?: number
    max?: number
  }
  credibilityScore?: {
    min?: number
    max?: number
  }
  attributes?: Array<{
    key: string
    value: string
  }>

  // Sort & Display
  sortBy?: 'relevance' | 'newest' | 'popular' | 'nearby'
  viewMode?: 'grid' | 'list' | 'map' | 'timeline'
}

/**
 * Serialize filters to URL search params
 */
export function serializeFiltersToURL(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams()

  // Basic filters
  if (filters.query) params.set('q', filters.query)
  if (filters.searchMode) params.set('mode', filters.searchMode)
  if (filters.category) params.set('cat', filters.category)

  // Hybrid options
  if (filters.language && filters.language !== 'de') params.set('lang', filters.language)
  if (filters.vectorWeight !== undefined && filters.vectorWeight !== 0.6) {
    params.set('vw', filters.vectorWeight.toString())
  }
  if (filters.crossLingual) params.set('xl', '1')

  // Date range
  if (filters.dateRange?.from) {
    params.set('from', filters.dateRange.from.toISOString().split('T')[0])
  }
  if (filters.dateRange?.to) {
    params.set('to', filters.dateRange.to.toISOString().split('T')[0])
  }

  // Witness count
  if (filters.witnessCount?.min !== undefined) {
    params.set('wmin', filters.witnessCount.min.toString())
  }
  if (filters.witnessCount?.max !== undefined) {
    params.set('wmax', filters.witnessCount.max.toString())
  }

  // Media types
  if (filters.mediaTypes && filters.mediaTypes.length > 0) {
    params.set('media', filters.mediaTypes.join(','))
  }

  // Location
  if (filters.location) {
    if (filters.location.lat !== undefined) params.set('lat', filters.location.lat.toString())
    if (filters.location.lng !== undefined) params.set('lng', filters.location.lng.toString())
    if (filters.location.radius !== undefined) params.set('radius', filters.location.radius.toString())
  }

  // Duration
  if (filters.duration?.min !== undefined) {
    params.set('dmin', filters.duration.min.toString())
  }
  if (filters.duration?.max !== undefined) {
    params.set('dmax', filters.duration.max.toString())
  }

  // Credibility score
  if (filters.credibilityScore?.min !== undefined) {
    params.set('cmin', filters.credibilityScore.min.toString())
  }
  if (filters.credibilityScore?.max !== undefined) {
    params.set('cmax', filters.credibilityScore.max.toString())
  }

  // Attributes (JSON encoded)
  if (filters.attributes && filters.attributes.length > 0) {
    params.set('attrs', JSON.stringify(filters.attributes))
  }

  // Sort & View
  if (filters.sortBy && filters.sortBy !== 'relevance') {
    params.set('sort', filters.sortBy)
  }
  if (filters.viewMode && filters.viewMode !== 'grid') {
    params.set('view', filters.viewMode)
  }

  return params
}

/**
 * Deserialize URL search params to filters
 */
export function deserializeFiltersFromURL(searchParams: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {}

  // Basic filters
  const query = searchParams.get('q')
  if (query) filters.query = query

  const mode = searchParams.get('mode')
  if (mode && ['hybrid', 'nlp', 'ask', 'advanced'].includes(mode)) {
    filters.searchMode = mode as any
  }

  const category = searchParams.get('cat')
  if (category) filters.category = category

  // Hybrid options
  const lang = searchParams.get('lang')
  if (lang && ['de', 'en', 'fr', 'es'].includes(lang)) {
    filters.language = lang as any
  }

  const vw = searchParams.get('vw')
  if (vw) {
    const weight = parseFloat(vw)
    if (!isNaN(weight) && weight >= 0 && weight <= 1) {
      filters.vectorWeight = weight
    }
  }

  if (searchParams.get('xl') === '1') {
    filters.crossLingual = true
  }

  // Date range
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  if (from || to) {
    filters.dateRange = {}
    if (from) {
      const date = new Date(from)
      if (!isNaN(date.getTime())) filters.dateRange.from = date
    }
    if (to) {
      const date = new Date(to)
      if (!isNaN(date.getTime())) filters.dateRange.to = date
    }
  }

  // Witness count
  const wmin = searchParams.get('wmin')
  const wmax = searchParams.get('wmax')
  if (wmin || wmax) {
    filters.witnessCount = {}
    if (wmin) {
      const min = parseInt(wmin, 10)
      if (!isNaN(min)) filters.witnessCount.min = min
    }
    if (wmax) {
      const max = parseInt(wmax, 10)
      if (!isNaN(max)) filters.witnessCount.max = max
    }
  }

  // Media types
  const media = searchParams.get('media')
  if (media) {
    filters.mediaTypes = media.split(',').filter(Boolean)
  }

  // Location
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius')
  if (lat || lng || radius) {
    filters.location = {}
    if (lat) {
      const latNum = parseFloat(lat)
      if (!isNaN(latNum)) filters.location.lat = latNum
    }
    if (lng) {
      const lngNum = parseFloat(lng)
      if (!isNaN(lngNum)) filters.location.lng = lngNum
    }
    if (radius) {
      const radiusNum = parseFloat(radius)
      if (!isNaN(radiusNum)) filters.location.radius = radiusNum
    }
  }

  // Duration
  const dmin = searchParams.get('dmin')
  const dmax = searchParams.get('dmax')
  if (dmin || dmax) {
    filters.duration = {}
    if (dmin) {
      const min = parseInt(dmin, 10)
      if (!isNaN(min)) filters.duration.min = min
    }
    if (dmax) {
      const max = parseInt(dmax, 10)
      if (!isNaN(max)) filters.duration.max = max
    }
  }

  // Credibility score
  const cmin = searchParams.get('cmin')
  const cmax = searchParams.get('cmax')
  if (cmin || cmax) {
    filters.credibilityScore = {}
    if (cmin) {
      const min = parseFloat(cmin)
      if (!isNaN(min)) filters.credibilityScore.min = min
    }
    if (cmax) {
      const max = parseFloat(cmax)
      if (!isNaN(max)) filters.credibilityScore.max = max
    }
  }

  // Attributes
  const attrs = searchParams.get('attrs')
  if (attrs) {
    try {
      const parsed = JSON.parse(attrs)
      if (Array.isArray(parsed)) {
        filters.attributes = parsed.filter(
          (attr: any) => attr && typeof attr.key === 'string' && typeof attr.value === 'string'
        )
      }
    } catch (e) {
      console.warn('Failed to parse attributes from URL:', e)
    }
  }

  // Sort & View
  const sort = searchParams.get('sort')
  if (sort && ['relevance', 'newest', 'popular', 'nearby'].includes(sort)) {
    filters.sortBy = sort as any
  }

  const view = searchParams.get('view')
  if (view && ['grid', 'list', 'map', 'timeline'].includes(view)) {
    filters.viewMode = view as any
  }

  return filters
}

/**
 * Update URL without page reload
 */
export function updateURL(filters: SearchFilters, replace: boolean = false) {
  const params = serializeFiltersToURL(filters)
  const url = `${window.location.pathname}?${params.toString()}`

  if (replace) {
    window.history.replaceState({}, '', url)
  } else {
    window.history.pushState({}, '', url)
  }
}

/**
 * Get current filters from URL
 */
export function getCurrentFiltersFromURL(): SearchFilters {
  if (typeof window === 'undefined') return {}
  return deserializeFiltersFromURL(new URLSearchParams(window.location.search))
}

/**
 * Generate shareable URL for current filters
 */
export function getShareableURL(filters: SearchFilters): string {
  const params = serializeFiltersToURL(filters)
  const baseURL = typeof window !== 'undefined'
    ? `${window.location.origin}/search`
    : '/search'

  return `${baseURL}?${params.toString()}`
}
