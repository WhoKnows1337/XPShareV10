/**
 * XPShare AI - Tools Index
 *
 * Central export point for all AI SDK tools.
 * Factory functions require request-scoped Supabase client for RLS.
 */

// Search Tool Factories (require Supabase client)
export {
  createAdvancedSearchTool,
  createSearchByAttributesTool,
  createSemanticSearchTool,
  createFullTextSearchTool,
  createGeoSearchTool,
} from './search'

// Analytics Tool Factories (require Supabase client)
export {
  createRankUsersTool,
  createAnalyzeCategoryTool,
  createCompareCategoryTool,
  createTemporalAnalysisTool,
  createAttributeCorrelationTool,
} from './analytics'

// Relationship Tool Factories (require Supabase client)
export { createFindConnectionsTool } from './relationships/find-connections'

// Insights Tool Factories (require Supabase client)
export { createGenerateInsightsTool } from './insights/generate-insights'

// Tools that don't need Supabase (work with pre-fetched data)
export { detectPatternsTool } from './relationships/detect-patterns'
export { predictTrendsTool } from './insights/predict-trends'
export { suggestFollowupsTool } from './insights/suggest-followups'
export { exportResultsTool } from './insights/export-results'
