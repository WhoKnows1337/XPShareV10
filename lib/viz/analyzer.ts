/**
 * XPShare AI - Data Structure Analyzer
 *
 * Analyzes data structure to determine optimal visualization types.
 * Detects geographic, temporal, connection, and distribution patterns.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface DataStructureAnalysis {
  /** Has geographic coordinates (lat/lng) */
  hasGeo: boolean

  /** Has temporal data (dates/times) */
  hasTemporal: boolean

  /** Has category information */
  hasCategories: boolean

  /** Has tag arrays */
  hasTags: boolean

  /** Has connection/relationship data */
  hasConnections: boolean

  /** Has ranking/numerical data */
  hasRankings: boolean

  /** Total number of data points */
  count: number

  /** Available field names */
  fields: string[]

  /** Geographic data ratio (0-1) */
  geoRatio: number

  /** Temporal data ratio (0-1) */
  temporalRatio: number

  /** Category diversity (unique categories / total) */
  categoryDiversity: number

  /** Recommended visualization types (ordered by priority) */
  recommendedViz: VisualizationType[]
}

export type VisualizationType = 'map' | 'timeline' | 'network' | 'heatmap' | 'dashboard' | 'chart'

// ============================================================================
// Data Analyzer Function
// ============================================================================

/**
 * Analyze data structure to determine patterns and optimal visualizations
 */
export function analyzeDataStructure(data: any): DataStructureAnalysis {
  // Normalize input to array
  const dataArray = Array.isArray(data)
    ? data
    : data?.results ||
      data?.experiences ||
      data?.users ||
      data?.connections ||
      data?.periods ||
      []

  // Handle empty data
  if (!dataArray || dataArray.length === 0) {
    return {
      hasGeo: false,
      hasTemporal: false,
      hasCategories: false,
      hasTags: false,
      hasConnections: false,
      hasRankings: false,
      count: 0,
      fields: [],
      geoRatio: 0,
      temporalRatio: 0,
      categoryDiversity: 0,
      recommendedViz: ['chart'],
    }
  }

  const firstItem = dataArray[0]
  const fields = Object.keys(firstItem || {})

  // Detect geographic data
  const hasGeo = detectGeographicData(fields)
  const geoRatio = calculateGeoRatio(dataArray)

  // Detect temporal data
  const hasTemporal = detectTemporalData(fields)
  const temporalRatio = calculateTemporalRatio(dataArray)

  // Detect categories
  const hasCategories = fields.includes('category')
  const categoryDiversity = calculateCategoryDiversity(dataArray)

  // Detect tags
  const hasTags = fields.includes('tags')

  // Detect connections
  const hasConnections = detectConnections(fields, dataArray)

  // Detect rankings
  const hasRankings = detectRankings(fields)

  // Determine recommended visualizations
  const recommendedViz = determineRecommendedViz({
    hasGeo,
    hasTemporal,
    hasCategories,
    hasConnections,
    hasRankings,
    count: dataArray.length,
    geoRatio,
    temporalRatio,
  })

  return {
    hasGeo,
    hasTemporal,
    hasCategories,
    hasTags,
    hasConnections,
    hasRankings,
    count: dataArray.length,
    fields,
    geoRatio,
    temporalRatio,
    categoryDiversity,
    recommendedViz,
  }
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect if data has geographic coordinates
 */
function detectGeographicData(fields: string[]): boolean {
  const geoFields = ['lat', 'latitude', 'lng', 'longitude', 'location_lat', 'location_lng']
  return geoFields.some((field) => fields.includes(field))
}

/**
 * Detect if data has temporal information
 */
function detectTemporalData(fields: string[]): boolean {
  const temporalFields = [
    'date_occurred',
    'created_at',
    'updated_at',
    'time_of_day',
    'timestamp',
    'period',
    'month',
    'year',
  ]
  return temporalFields.some((field) => fields.includes(field))
}

/**
 * Detect if data has connection/relationship structure
 */
function detectConnections(fields: string[], data: any[]): boolean {
  // Check for explicit connection fields
  const connectionFields = ['edges', 'connections', 'nodes', 'related', 'similarity_score']
  const hasConnectionFields = connectionFields.some((field) => fields.includes(field))

  if (hasConnectionFields) return true

  // Check if data has nested connection structure
  if (data.length > 0 && data[0].connections) {
    return Array.isArray(data[0].connections) && data[0].connections.length > 0
  }

  return false
}

/**
 * Detect if data has ranking/numerical metrics
 */
function detectRankings(fields: string[]): boolean {
  const rankingFields = [
    'score',
    'rank',
    'count',
    'total',
    'experience_count',
    'total_xp',
    'confidence',
    'similarity_score',
  ]
  return rankingFields.some((field) => fields.includes(field))
}

// ============================================================================
// Ratio Calculations
// ============================================================================

/**
 * Calculate ratio of data points with geographic coordinates
 */
function calculateGeoRatio(data: any[]): number {
  if (data.length === 0) return 0

  const withGeo = data.filter((item) => {
    const hasLat =
      item.lat !== undefined ||
      item.latitude !== undefined ||
      item.location_lat !== undefined
    const hasLng =
      item.lng !== undefined ||
      item.longitude !== undefined ||
      item.location_lng !== undefined
    return hasLat && hasLng
  }).length

  return withGeo / data.length
}

/**
 * Calculate ratio of data points with temporal information
 */
function calculateTemporalRatio(data: any[]): number {
  if (data.length === 0) return 0

  const withTemporal = data.filter((item) => {
    return (
      item.date_occurred ||
      item.created_at ||
      item.updated_at ||
      item.time_of_day ||
      item.timestamp ||
      item.period ||
      item.month ||
      item.year
    )
  }).length

  return withTemporal / data.length
}

/**
 * Calculate category diversity (unique categories / total items)
 */
function calculateCategoryDiversity(data: any[]): number {
  if (data.length === 0) return 0

  const categories = new Set(data.map((item) => item.category).filter(Boolean))

  return categories.size / data.length
}

// ============================================================================
// Visualization Recommendation
// ============================================================================

/**
 * Determine recommended visualization types based on data characteristics
 */
function determineRecommendedViz(analysis: {
  hasGeo: boolean
  hasTemporal: boolean
  hasCategories: boolean
  hasConnections: boolean
  hasRankings: boolean
  count: number
  geoRatio: number
  temporalRatio: number
}): VisualizationType[] {
  const recommendations: VisualizationType[] = []

  // Priority 1: Map (if >50% have geo and count > 1)
  if (analysis.hasGeo && analysis.geoRatio > 0.5 && analysis.count > 1) {
    recommendations.push('map')
  }

  // Priority 2: Network (if has connections)
  if (analysis.hasConnections) {
    recommendations.push('network')
  }

  // Priority 3: Timeline (if >50% have temporal and count > 2)
  if (analysis.hasTemporal && analysis.temporalRatio > 0.5 && analysis.count > 2) {
    recommendations.push('timeline')
  }

  // Priority 4: Heatmap (if has both categories and temporal)
  if (analysis.hasCategories && analysis.hasTemporal && analysis.count > 5) {
    recommendations.push('heatmap')
  }

  // Priority 5: Chart (if has rankings or as fallback)
  if (analysis.hasRankings || recommendations.length === 0) {
    recommendations.push('chart')
  }

  // Priority 6: Dashboard (if multiple patterns detected)
  if (recommendations.length >= 2) {
    recommendations.push('dashboard')
  }

  return recommendations
}

// ============================================================================
// Export Helper Functions
// ============================================================================

/**
 * Get primary recommended visualization
 */
export function getPrimaryViz(analysis: DataStructureAnalysis): VisualizationType {
  return analysis.recommendedViz[0] || 'chart'
}

/**
 * Check if data is suitable for specific visualization
 */
export function isSuitableFor(
  analysis: DataStructureAnalysis,
  vizType: VisualizationType
): boolean {
  return analysis.recommendedViz.includes(vizType)
}

/**
 * Get visualization priority score (0-1, higher = better fit)
 */
export function getVizPriorityScore(
  analysis: DataStructureAnalysis,
  vizType: VisualizationType
): number {
  const index = analysis.recommendedViz.indexOf(vizType)
  if (index === -1) return 0

  // Higher priority = higher score
  return 1 - index / analysis.recommendedViz.length
}
