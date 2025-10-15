import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface PatternMatchingRequest {
  text: string
  category: string | null
  location: { name: string; coordinates?: [number, number] } | null
  timestamp: string | null
  minSimilarity?: number
  maxResults?: number
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      text,
      category,
      location,
      timestamp,
      minSimilarity = 0.7,
      maxResults = 20,
    }: PatternMatchingRequest = await req.json()

    // Generate embedding
    const embedding = await generateEmbedding(text)

    // Find similar experiences (parallel queries)
    const [
      similarExperiences,
      geographicClusters,
      temporalClusters,
      externalEvents,
      interestedUsers,
    ] = await Promise.all([
      findSimilarExperiences(supabase, embedding, category, minSimilarity, maxResults),
      findGeographicClusters(supabase, location, category),
      findTemporalClusters(supabase, timestamp, category),
      fetchExternalEvents(timestamp, location),
      findInterestedUsers(supabase, category, location),
    ])

    // Analyze patterns and suggest tags
    const suggestedTags = await analyzePatternsForTags(
      text,
      similarExperiences,
      category
    )

    // Calculate correlations
    const correlations = calculateCorrelations(
      similarExperiences,
      externalEvents,
      temporalClusters
    )

    const insights = {
      similar: similarExperiences,
      geographic: geographicClusters,
      temporal: temporalClusters,
      externalEvents,
      interestedUsers,
      suggestedTags,
      correlations,
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Pattern matching error:', error)
    return NextResponse.json(
      { error: 'Pattern matching failed' },
      { status: 500 }
    )
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000),
  })
  return response.data[0].embedding
}

async function findSimilarExperiences(
  supabase: any,
  embedding: number[],
  category: string | null,
  minSimilarity: number,
  maxResults: number
) {
  try {
    const { data, error } = await (supabase as any).rpc('find_similar_experiences', {
      query_embedding: embedding,
      category_filter: category,
      similarity_threshold: minSimilarity,
      max_results: maxResults,
    })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Find similar experiences error:', error)
    return []
  }
}

async function findGeographicClusters(
  supabase: any,
  location: { name: string; coordinates?: [number, number] } | null,
  category: string | null
) {
  if (!location?.coordinates) return []

  try {
    const [lng, lat] = location.coordinates
    const radius_km = 100 // 100km radius

    const { data, error } = await (supabase as any).rpc('find_geographic_clusters', {
      center_lat: lat,
      center_lng: lng,
      radius_km,
      category_filter: category,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Geographic clusters error:', error)
    return []
  }
}

async function findTemporalClusters(
  supabase: any,
  timestamp: string | null,
  category: string | null
) {
  if (!timestamp) return []

  try {
    const targetDate = new Date(timestamp)
    const daysWindow = 30 // ±30 days

    const { data, error } = await (supabase as any).rpc('find_temporal_clusters', {
      target_date: timestamp,
      days_window: daysWindow,
      category_filter: category,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Temporal clusters error:', error)
    return []
  }
}

async function fetchExternalEvents(
  timestamp: string | null,
  location: { name: string; coordinates?: [number, number] } | null
) {
  if (!timestamp) return []

  const events: any[] = []
  const targetDate = new Date(timestamp)

  try {
    // Solar Events (NOAA)
    const solarEvents = await fetchSolarEvents(targetDate)
    events.push(...solarEvents)

    // Moon Phase
    const moonPhase = calculateMoonPhase(targetDate)
    if (moonPhase.illumination > 0.85 || moonPhase.illumination < 0.15) {
      events.push({
        type: 'moon',
        title: moonPhase.phase,
        description: `Moon ${Math.round(moonPhase.illumination * 100)}% illuminated`,
        timestamp: timestamp,
        relevance: moonPhase.illumination > 0.85 ? 0.7 : 0.5,
        data: moonPhase,
      })
    }

    // Earthquakes (if location provided)
    if (location?.coordinates) {
      const earthquakes = await fetchEarthquakes(targetDate, location.coordinates)
      events.push(...earthquakes)
    }

    // Weather (simplified - in production, use weather API)
    // TODO: Integrate OpenWeatherMap or similar
  } catch (error) {
    console.error('External events fetch error:', error)
  }

  return events
}

async function fetchSolarEvents(date: Date) {
  try {
    // Fetch NOAA solar events
    const response = await fetch(
      'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json',
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()

    const events: any[] = []
    const targetTime = date.getTime()
    const threeDays = 3 * 24 * 60 * 60 * 1000

    data.forEach((event: any) => {
      const eventTime = new Date(event.time_tag).getTime()
      const timeDiff = Math.abs(targetTime - eventTime)

      if (timeDiff < threeDays && event.flux > 1e-5) {
        events.push({
          type: 'solar',
          title: 'Solar Activity Detected',
          description: `X-ray flux: ${event.flux.toExponential(2)}`,
          timestamp: event.time_tag,
          relevance: Math.min(1, event.flux / 1e-4),
          data: event,
        })
      }
    })

    return events.slice(0, 3) // Top 3 events
  } catch (error) {
    console.error('Solar events fetch error:', error)
    return []
  }
}

async function fetchEarthquakes(date: Date, coordinates: [number, number]) {
  try {
    const [lng, lat] = coordinates
    const startDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days before
    const endDate = new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day after

    const response = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate.toISOString()}&endtime=${endDate.toISOString()}&latitude=${lat}&longitude=${lng}&maxradiuskm=500&minmagnitude=4.0`,
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()

    const events = data.features.map((feature: any) => ({
      type: 'earthquake',
      title: `Magnitude ${feature.properties.mag} Earthquake`,
      description: feature.properties.place,
      timestamp: new Date(feature.properties.time).toISOString(),
      relevance: Math.min(1, feature.properties.mag / 7.0),
      data: feature,
    }))

    return events.slice(0, 5) // Top 5 earthquakes
  } catch (error) {
    console.error('Earthquakes fetch error:', error)
    return []
  }
}

function calculateMoonPhase(date: Date) {
  const LUNAR_MONTH = 29.53058867
  const KNOWN_NEW_MOON = new Date('2000-01-06').getTime()

  const diff = date.getTime() - KNOWN_NEW_MOON
  const days = diff / (1000 * 60 * 60 * 24)
  const phase = (days % LUNAR_MONTH) / LUNAR_MONTH

  let phaseName = 'New Moon'
  if (phase < 0.125) phaseName = 'New Moon'
  else if (phase < 0.25) phaseName = 'Waxing Crescent'
  else if (phase < 0.375) phaseName = 'First Quarter'
  else if (phase < 0.5) phaseName = 'Waxing Gibbous'
  else if (phase < 0.625) phaseName = 'Full Moon'
  else if (phase < 0.75) phaseName = 'Waning Gibbous'
  else if (phase < 0.875) phaseName = 'Last Quarter'
  else phaseName = 'Waning Crescent'

  const illumination = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI)

  return { phase: phaseName, illumination }
}

async function findInterestedUsers(
  supabase: any,
  category: string | null,
  location: { name: string; coordinates?: [number, number] } | null
) {
  try {
    const { data, error } = await (supabase as any).rpc('find_interested_users', {
      category_filter: category,
      location_filter: location?.name,
      max_users: 10,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Interested users error:', error)
    return []
  }
}

async function analyzePatternsForTags(
  text: string,
  similarExperiences: any[],
  category: string | null
) {
  try {
    // Extract common tags from similar experiences
    const tagCounts: Record<string, number> = {}

    similarExperiences.forEach((exp: any) => {
      if (exp.tags && Array.isArray(exp.tags)) {
        exp.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Sort by frequency
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)

    return sortedTags
  } catch (error) {
    console.error('Tag analysis error:', error)
    return []
  }
}

function calculateCorrelations(
  similarExperiences: any[],
  externalEvents: any[],
  temporalClusters: any[]
) {
  const correlations: any[] = []

  // Solar correlation
  const solarEvents = externalEvents.filter(e => e.type === 'solar')
  if (solarEvents.length > 0 && similarExperiences.length > 5) {
    const percentage = Math.round((solarEvents.length / similarExperiences.length) * 100)
    correlations.push({
      type: 'solar',
      description: `${percentage}% of similar experiences occurred during solar activity`,
      strength: Math.min(1, percentage / 50),
    })
  }

  // Temporal clustering
  if (temporalClusters.length > 0) {
    const largestCluster = temporalClusters.reduce((max, cluster) =>
      cluster.count > max.count ? cluster : max
    )
    correlations.push({
      type: 'temporal',
      description: `${largestCluster.count} experiences in ${largestCluster.period}`,
      strength: Math.min(1, largestCluster.count / 20),
    })
  }

  // Full moon correlation
  const fullMoonEvents = externalEvents.filter(
    e => e.type === 'moon' && e.data?.illumination > 0.9
  )
  if (fullMoonEvents.length > 0) {
    correlations.push({
      type: 'lunar',
      description: 'Experience occurred during full moon phase',
      strength: 0.6,
    })
  }

  return correlations
}
