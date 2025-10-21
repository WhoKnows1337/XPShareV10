import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'

/**
 * Hybrid Search Function
 *
 * Combines Vector Search (semantic) + Full-Text Search (keyword) using RRF
 * Supports advanced filtering: attributes, date ranges, tags, witnesses, location
 *
 * Used by: /lib/ai/tools/search-tool.ts
 */

export interface HybridSearchFilters {
  category?: string
  tags?: string[]
  location?: string
  dateRange?: {
    from?: string
    to?: string
  }
  witnessesOnly?: boolean
  exclude?: {
    tags?: string[]
  }
  // Category-specific attributes (170+ attributes across 43 categories)
  attributes?: {
    include?: Record<string, string[]> // e.g., { shape: ['triangle'], light_color: ['red'] }
    exclude?: Record<string, string[]> // e.g., { surface: ['metallic'] }
  }
}

export interface HybridSearchParams {
  embedding?: number[] | null // Vector embedding for semantic search
  query?: string // Text query for FTS
  filters?: HybridSearchFilters
  similarTo?: string // Experience ID for similarity search
  maxResults?: number
  language?: 'de' | 'en' | 'fr' | 'es'
  vectorWeight?: number // 0-1, default 0.6
}

export interface HybridSearchResult {
  id: string
  title: string
  description: string
  story_text: string
  category_slug: string
  category: string
  location: string
  location_text: string
  latitude?: number
  longitude?: number
  location_lat?: number
  location_lng?: number
  experience_date: string
  date_occurred: string
  tags: string[]
  attributes?: Record<string, string>
  similarity_score: number
  combined_score: number
  vector_score: number
  fts_score: number
  user_id: string
  username?: string
  display_name?: string
  avatar_url?: string
  created_at: string
}

/**
 * Hybrid Search - Main Entry Point
 */
export async function hybridSearch(
  params: HybridSearchParams
): Promise<HybridSearchResult[]> {
  const {
    embedding,
    query,
    filters = {},
    similarTo,
    maxResults = 15,
    language = 'de',
    vectorWeight = 0.6,
  } = params

  const supabase = await createClient()

  // Step 1: If similarTo is provided, fetch that experience's embedding
  let queryEmbedding = embedding

  if (similarTo && !queryEmbedding) {
    const { data: sourceExp, error: fetchError } = await supabase
      .from('experiences')
      .select('embedding')
      .eq('id', similarTo)
      .single()

    if (fetchError || !sourceExp?.embedding) {
      throw new Error(`Failed to fetch embedding for experience ${similarTo}`)
    }

    // Parse embedding from JSON string to number array
    queryEmbedding = typeof sourceExp.embedding === 'string'
      ? JSON.parse(sourceExp.embedding)
      : (sourceExp.embedding as unknown as number[])
  }

  // Step 2: If query provided but no embedding, generate it
  if (query && !queryEmbedding) {
    queryEmbedding = await generateEmbedding(query)
  }

  // Step 3: Call hybrid_search RPC function
  const { data: baseResults, error: searchError } = await (supabase as any).rpc(
    'hybrid_search',
    {
      p_query_text: query || '',
      p_query_embedding: queryEmbedding || null,
      p_language: language,
      p_vector_weight: vectorWeight,
      p_fts_weight: 1 - vectorWeight,
      p_category: filters.category || null,
      p_limit: maxResults * 3, // Fetch more for post-filtering
    }
  )

  if (searchError) {
    console.error('Hybrid search RPC error:', searchError)
    throw searchError
  }

  if (!baseResults || baseResults.length === 0) {
    return []
  }

  // Step 4: Apply additional filters (tags, dateRange, location, witnesses, attributes)
  let results: HybridSearchResult[] = baseResults.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.story_text?.substring(0, 500) || '',
    story_text: r.story_text,
    category_slug: r.category,
    category: r.category,
    location: r.location_text || '',
    location_text: r.location_text || '',
    latitude: r.location_lat,
    longitude: r.location_lng,
    location_lat: r.location_lat,
    location_lng: r.location_lng,
    experience_date: r.date_occurred,
    date_occurred: r.date_occurred,
    tags: r.tags || [],
    similarity_score: r.combined_score || 0,
    combined_score: r.combined_score || 0,
    vector_score: r.vector_score || 0,
    fts_score: r.fts_score || 0,
    user_id: r.user_id,
    username: r.username,
    display_name: r.display_name,
    avatar_url: r.avatar_url,
    created_at: r.created_at,
  }))

  // Filter by tags (include)
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((exp) =>
      filters.tags!.some((tag) => exp.tags?.includes(tag))
    )
  }

  // Filter by tags (exclude)
  if (filters.exclude?.tags && filters.exclude.tags.length > 0) {
    results = results.filter(
      (exp) =>
        !filters.exclude!.tags!.some((tag) => exp.tags?.includes(tag))
    )
  }

  // Filter by date range
  if (filters.dateRange) {
    const { from, to } = filters.dateRange

    results = results.filter((exp) => {
      if (!exp.date_occurred) return false
      const expDate = new Date(exp.date_occurred)

      if (from && expDate < new Date(from)) return false
      if (to && expDate > new Date(to)) return false

      return true
    })
  }

  // Filter by location (fuzzy match)
  if (filters.location) {
    const locationLower = filters.location.toLowerCase()
    results = results.filter((exp) =>
      exp.location_text?.toLowerCase().includes(locationLower)
    )
  }

  // Step 5: Fetch and apply attribute filters (if specified)
  if (filters.attributes?.include || filters.attributes?.exclude) {
    const experienceIds = results.map((r) => r.id)

    if (experienceIds.length > 0) {
      // Fetch all attributes for these experiences
      const { data: attributes, error: attrError } = await supabase
        .from('experience_attributes')
        .select('experience_id, attribute_key, attribute_value')
        .in('experience_id', experienceIds)

      if (attrError) {
        console.error('Failed to fetch attributes:', attrError)
      } else {
        // Group attributes by experience_id
        const attrMap = new Map<string, Record<string, string[]>>()

        attributes?.forEach((attr) => {
          if (!attrMap.has(attr.experience_id)) {
            attrMap.set(attr.experience_id, {})
          }
          const expAttrs = attrMap.get(attr.experience_id)!
          if (!expAttrs[attr.attribute_key]) {
            expAttrs[attr.attribute_key] = []
          }
          expAttrs[attr.attribute_key].push(attr.attribute_value)
        })

        // Apply INCLUDE filters (all must match)
        if (filters.attributes.include) {
          results = results.filter((exp) => {
            const expAttrs = attrMap.get(exp.id)
            if (!expAttrs) return false

            // Check if ALL include filters match
            return Object.entries(filters.attributes!.include!).every(
              ([key, values]) => {
                const expValues = expAttrs[key] || []
                // At least one value must match
                return values.some((v) => expValues.includes(v))
              }
            )
          })
        }

        // Apply EXCLUDE filters (none must match)
        if (filters.attributes.exclude) {
          results = results.filter((exp) => {
            const expAttrs = attrMap.get(exp.id)
            if (!expAttrs) return true // No attributes = pass

            // Check if NONE of the exclude filters match
            return Object.entries(filters.attributes!.exclude!).every(
              ([key, values]) => {
                const expValues = expAttrs[key] || []
                // NONE of the values should match
                return !values.some((v) => expValues.includes(v))
              }
            )
          })
        }

        // Attach attributes to results
        results = results.map((exp) => {
          const expAttrs = attrMap.get(exp.id)
          if (expAttrs) {
            // Convert Record<string, string[]> to Record<string, string>
            const simplifiedAttrs: Record<string, string> = {}
            Object.entries(expAttrs).forEach(([key, values]) => {
              simplifiedAttrs[key] = values[0] // Take first value
            })
            exp.attributes = simplifiedAttrs
          }
          return exp
        })
      }
    }
  }

  // Filter by witnesses (if specified)
  if (filters.witnessesOnly) {
    const experienceIds = results.map((r) => r.id)

    if (experienceIds.length > 0) {
      const { data: witnessData } = await supabase
        .from('experience_witnesses')
        .select('experience_id')
        .in('experience_id', experienceIds)

      const idsWithWitnesses = new Set(
        witnessData?.map((w) => w.experience_id) || []
      )

      results = results.filter((exp) => idsWithWitnesses.has(exp.id))
    }
  }

  // Step 6: Limit to maxResults
  return results.slice(0, maxResults)
}

/**
 * Helper: Get all experiences (for statistics/aggregations)
 */
export async function getAllExperiences(): Promise<HybridSearchResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('experiences')
    .select(
      `
      id,
      title,
      story_text,
      category,
      date_occurred,
      location_text,
      location_lat,
      location_lng,
      tags,
      user_id,
      created_at
    `
    )
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('Failed to fetch all experiences:', error)
    return []
  }

  return (data || []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.story_text?.substring(0, 500) || '',
    story_text: r.story_text || '',
    category_slug: r.category,
    category: r.category,
    location: r.location_text || '',
    location_text: r.location_text || '',
    latitude: r.location_lat ? Number(r.location_lat) : undefined,
    longitude: r.location_lng ? Number(r.location_lng) : undefined,
    location_lat: r.location_lat ? Number(r.location_lat) : undefined,
    location_lng: r.location_lng ? Number(r.location_lng) : undefined,
    experience_date: r.date_occurred || '',
    date_occurred: r.date_occurred || '',
    tags: r.tags || [],
    similarity_score: 0,
    combined_score: 0,
    vector_score: 0,
    fts_score: 0,
    user_id: r.user_id || '',
    created_at: r.created_at,
  })) as HybridSearchResult[]
}

/**
 * Helper: Get specific experiences by IDs
 */
export async function getExperiences(
  ids: string[]
): Promise<HybridSearchResult[]> {
  if (!ids || ids.length === 0) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('experiences')
    .select(
      `
      id,
      title,
      story_text,
      category,
      date_occurred,
      location_text,
      location_lat,
      location_lng,
      tags,
      user_id,
      created_at
    `
    )
    .in('id', ids)
    .eq('visibility', 'public')

  if (error) {
    console.error('Failed to fetch experiences:', error)
    return []
  }

  return (data || []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.story_text?.substring(0, 500) || '',
    story_text: r.story_text || '',
    category_slug: r.category,
    category: r.category,
    location: r.location_text || '',
    location_text: r.location_text || '',
    latitude: r.location_lat ? Number(r.location_lat) : undefined,
    longitude: r.location_lng ? Number(r.location_lng) : undefined,
    location_lat: r.location_lat ? Number(r.location_lat) : undefined,
    location_lng: r.location_lng ? Number(r.location_lng) : undefined,
    experience_date: r.date_occurred || '',
    date_occurred: r.date_occurred || '',
    tags: r.tags || [],
    similarity_score: 0,
    combined_score: 0,
    vector_score: 0,
    fts_score: 0,
    user_id: r.user_id || '',
    created_at: r.created_at,
  })) as HybridSearchResult[]
}

/**
 * Helper: Get total count of public experiences
 */
export async function getTotalCount(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('visibility', 'public')

  if (error) {
    console.error('Failed to count experiences:', error)
    return 0
  }

  return count || 0
}
