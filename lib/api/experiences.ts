import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { getExternalEvents } from './external-events'

/**
 * Type for RPC match_experiences response (actual fields from the RPC)
 */
interface MatchExperienceResult {
  id: string
  title: string
  category: string
  date_occurred?: string
  location_text?: string
  story_text?: string
  tags?: string[]
  exact_match?: boolean
  similarity: number
}

/**
 * Type for attribute-based similarity match
 */
interface AttributeMatchResult {
  experience_id: string
  similarity_score: number
}

/**
 * Type for similar experience with match score
 */
export interface SimilarExperienceResult {
  id: string
  title: string
  category: string
  created_at: string
  user_profiles?: {
    username: string
    display_name?: string
  } | null
  match_score: number
}

/**
 * Get experience by ID with all related data
 */
export const getExperience = cache(async (id: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('experiences')
    .select(`
      *,
      user_profiles!experiences_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        level,
        total_xp
      ),
      media:experience_media(*),
      answers:experience_answers(
        id,
        answer_value,
        question:dynamic_questions(
          id,
          question_text,
          question_type,
          options
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
})

/**
 * Get similar experiences using vector similarity search
 * Uses pgvector for semantic similarity - NO FAKE SCORES
 */
export const getSimilarExperiences = cache(async (experienceId: string, limit: number = 12): Promise<SimilarExperienceResult[]> => {
  const supabase = await createClient()

  // First get the current experience's embedding
  const { data: experience } = await supabase
    .from('experiences')
    .select('embedding, category')
    .eq('id', experienceId)
    .single()

  // Strategy 1: pgvector semantic search (preferred)
  if (experience?.embedding) {
    const { data, error } = await supabase.rpc('match_experiences', {
      query_embedding: experience.embedding,
      match_threshold: 0.5,
      match_count: limit + 1, // +1 because we filter out self
    })

    if (!error && data && data.length > 0) {
      // Filter out self and convert similarity 0-1 → 0-100
      const filtered = (data as MatchExperienceResult[])
        .filter((m) => m.id !== experienceId)
        .slice(0, limit)
        .map((m): SimilarExperienceResult => ({
          id: m.id,
          title: m.title,
          category: m.category,
          created_at: m.date_occurred || new Date().toISOString(),
          user_profiles: null, // RPC doesn't return user_profiles, will be hydrated on display
          match_score: Math.round(m.similarity * 100),
        }))

      if (filtered.length > 0) {
        return filtered
      }
    }
  }

  // Strategy 2: Attribute-based similarity
  const { data: attrMatches } = await supabase.rpc('find_experiences_by_shared_attributes', {
    p_experience_id: experienceId,
    p_threshold: 0.3,
    p_limit: limit,
  })

  if (attrMatches && attrMatches.length > 0) {
    // Fetch full experience details
    const matchIds = (attrMatches as AttributeMatchResult[]).map((m) => m.experience_id)
    const { data: fullExperiences } = await supabase
      .from('experiences')
      .select(`
        id, title, category, created_at,
        user_profiles!experiences_user_id_fkey (username, display_name)
      `)
      .in('id', matchIds)
      .eq('visibility', 'public')

    type FullExpType = { id: string; title: string; category: string; created_at: string; user_profiles: { username: string; display_name?: string } | null }
    const expMap = new Map<string, FullExpType>((fullExperiences as FullExpType[] | null)?.map((e) => [e.id, e]) || [])

    return (attrMatches as AttributeMatchResult[]).map((match): SimilarExperienceResult => {
      const exp = expMap.get(match.experience_id)
      return {
        id: exp?.id || match.experience_id,
        title: exp?.title || '',
        category: exp?.category || '',
        created_at: exp?.created_at || '',
        user_profiles: exp?.user_profiles,
        match_score: Math.round(match.similarity_score * 100),
      }
    }).filter((e) => e.title) // Filter out experiences we couldn't find
  }

  // Strategy 3: Same category fallback (honest scores, no random)
  const { data } = await supabase
    .from('experiences')
    .select(`
      id, title, category, created_at,
      user_profiles!experiences_user_id_fkey (username, display_name)
    `)
    .eq('category', experience?.category || 'other')
    .neq('id', experienceId)
    .eq('visibility', 'public')
    .limit(limit)

  type FallbackExpType = { id: string; title: string; category: string; created_at: string; user_profiles: { username: string; display_name?: string } | null }
  // Honest score: 40% base for same category (no random!)
  return (data as FallbackExpType[] | null)?.map((exp): SimilarExperienceResult => ({
    id: exp.id,
    title: exp.title,
    category: exp.category,
    created_at: exp.created_at,
    user_profiles: exp.user_profiles,
    match_score: 40, // Honest: same category only = 40%
  })) || []
})

/**
 * Get environmental/external events for an experience
 */
export const getEnvironmentalData = cache(async (
  dateOccurred: string,
  locationLat?: number,
  locationLng?: number
) => {
  if (!dateOccurred) return []

  const date = new Date(dateOccurred)
  const events = await getExternalEvents(date, locationLat, locationLng)

  return events
})

/**
 * Get cross-category insights for pattern detection
 */
export const getCrossCategoryInsights = cache(async (category: string) => {
  const supabase = await createClient()

  const { data } = await (supabase as any).rpc('get_cross_category_insights', {
    p_category: category,
  })

  return data || []
})

/**
 * Get timeline data for temporal pattern analysis
 */
export const getTimelineData = cache(async (category: string, months: number = 12) => {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const { data } = await supabase
    .from('experiences')
    .select('date_occurred, created_at')
    .eq('category', category)
    .eq('visibility', 'public')
    .gte('date_occurred', startDate.toISOString())
    .order('date_occurred', { ascending: true })

  if (!data) return []

  // Group by month
  const monthlyData: { [key: string]: number } = {}

  data.forEach((exp) => {
    const dateValue = exp.date_occurred || exp.created_at
    if (!dateValue) return // Skip if no date available
    const date = new Date(dateValue)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
  })

  return Object.entries(monthlyData)
    .map(([month, count]) => ({
      month,
      count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
})

/**
 * Get nearby experiences for map clustering
 */
export const getNearbyExperiences = cache(async (
  lat: number,
  lng: number,
  radiusKm: number = 50,
  limit: number = 20
) => {
  const supabase = await createClient()

  // Use PostGIS for geospatial queries
  const { data } = await (supabase as any).rpc('get_nearby_experiences', {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
    p_limit: limit,
  })

  return data || []
})
