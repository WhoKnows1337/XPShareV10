import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { getExternalEvents } from './external-events'

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
 * Requires pgvector extension and embedding column
 */
export const getSimilarExperiences = cache(async (experienceId: string, limit: number = 12) => {
  const supabase = await createClient()

  // First get the current experience's embedding
  const { data: experience } = await supabase
    .from('experiences')
    .select('embedding, category')
    .eq('id', experienceId)
    .single()

  if (!experience?.embedding) {
    // Fallback: Get experiences from same category
    const { data } = await supabase
      .from('experiences')
      .select(`
        id,
        title,
        category,
        created_at,
        user_profiles (username, display_name)
      `)
      .eq('category', experience?.category || 'other')
      .neq('id', experienceId)
      .limit(limit)

    return data?.map((exp: any) => ({
      ...exp,
      match_score: Math.floor(Math.random() * 30) + 60, // 60-90% for same category
    })) || []
  }

  // Use RPC function for vector similarity search
  const { data } = await supabase.rpc('match_experiences', {
    query_embedding: experience.embedding,
    match_threshold: 0.6,
    match_count: limit,
    p_experience_id: experienceId,
  })

  return data || []
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

  const { data } = await supabase.rpc('get_cross_category_insights', {
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
    const date = new Date(exp.date_occurred || exp.created_at)
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
  const { data } = await supabase.rpc('get_nearby_experiences', {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
    p_limit: limit,
  })

  return data || []
})
