/**
 * API Route: GET /api/experiences/[id]/patterns/analytics
 *
 * Returns comprehensive analytics data for pattern visualization:
 * - Geographic clusters (heatmap)
 * - Temporal timeline (experience count over time)
 * - Attribute correlations (correlation matrix)
 *
 * Part of Phase 4: Advanced Analytics
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: experienceId } = await params
    const supabase = await createClient()

    // Get the base experience
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select('id, category, location_lat, location_lng, created_at, tags')
      .eq('id', experienceId)
      .single()

    if (expError || !experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    // === GEOGRAPHIC ANALYSIS ===
    // Find similar experiences by category with location data
    const { data: geoExperiences } = await supabase
      .from('experiences')
      .select('id, title, location_lat, location_lng, created_at')
      .eq('category', experience.category)
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null)
      .limit(100)

    // Create geographic clusters (simplified clustering by proximity)
    const clusters: any[] = []
    if (experience.location_lat && experience.location_lng && geoExperiences) {
      // Current experience location
      clusters.push({
        id: 'current',
        center_lat: experience.location_lat,
        center_lng: experience.location_lng,
        radius_km: 50,
        experience_count: 1,
        is_current: true,
        experiences: [{
          id: experience.id,
          lat: experience.location_lat,
          lng: experience.location_lng,
        }]
      })

      // Create clusters from nearby experiences (within 100km)
      const nearbyGroups = new Map<string, any[]>()

      geoExperiences.forEach(exp => {
        if (exp.id === experienceId) return
        if (exp.location_lat === null || exp.location_lng === null) return

        const distance = calculateDistance(
          experience.location_lat!,
          experience.location_lng!,
          exp.location_lat,
          exp.location_lng
        )

        if (distance <= 100) {
          const key = `${Math.floor(exp.location_lat * 10)}_${Math.floor(exp.location_lng * 10)}`
          if (!nearbyGroups.has(key)) {
            nearbyGroups.set(key, [])
          }
          nearbyGroups.get(key)!.push(exp)
        }
      })

      // Convert groups to clusters
      nearbyGroups.forEach((exps, key) => {
        if (exps.length >= 2) {
          const avgLat = exps.reduce((sum, e) => sum + e.location_lat, 0) / exps.length
          const avgLng = exps.reduce((sum, e) => sum + e.location_lng, 0) / exps.length

          clusters.push({
            id: key,
            center_lat: avgLat,
            center_lng: avgLng,
            radius_km: 25,
            experience_count: exps.length,
            is_current: false,
            increase_vs_baseline: Math.round((exps.length / 10) * 100),
            experiences: exps.map(e => ({
              id: e.id,
              title: e.title,
              lat: e.location_lat,
              lng: e.location_lng,
            }))
          })
        }
      })
    }

    // === TEMPORAL ANALYSIS ===
    // Get timeline data for similar experiences
    const { data: timelineExperiences } = await supabase
      .from('experiences')
      .select('created_at')
      .eq('category', experience.category)
      .order('created_at', { ascending: true })

    // Group by day and calculate cumulative count
    const timelineData: any[] = []
    const dailyCounts = new Map<string, number>()

    if (timelineExperiences) {
      timelineExperiences.forEach(exp => {
        if (!exp.created_at) return
        const date = new Date(exp.created_at).toISOString().split('T')[0]
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1)
      })

      let cumulative = 0
      const sortedDates = Array.from(dailyCounts.keys()).sort()

      sortedDates.forEach(date => {
        const count = dailyCounts.get(date)!
        cumulative += count
        timelineData.push({
          date,
          count,
          cumulative_count: cumulative,
        })
      })
    }

    // Detect temporal spikes (simplified: days with >3x average)
    const avgDaily = timelineData.length > 0
      ? timelineData.reduce((sum, d) => sum + d.count, 0) / timelineData.length
      : 0

    const spikes = timelineData
      .filter(d => d.count > avgDaily * 3)
      .map(d => ({
        spike_date: d.date,
        experience_count: d.count,
        expected_count: Math.round(avgDaily),
        significance: Math.round((d.count / avgDaily) * 100) / 100,
      }))

    // Mark current experience date
    const currentExperienceDate = experience.created_at
      ? new Date(experience.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    // === ATTRIBUTE CORRELATIONS ===
    // Get attributes for similar experiences
    const { data: attributeData } = await supabase
      .from('experience_attributes')
      .select(`
        attribute_key,
        attribute_value,
        experience_id
      `)
      .in('experience_id', [
        experienceId,
        ...(geoExperiences?.map(e => e.id) || [])
      ])

    // Calculate co-occurrence matrix
    const correlations: any[] = []
    const attrPairs = new Map<string, {count: number, exps: Set<string>}>()

    if (attributeData) {
      // Group attributes by experience
      const expAttrs = new Map<string, Set<string>>()
      attributeData.forEach(attr => {
        if (!expAttrs.has(attr.experience_id)) {
          expAttrs.set(attr.experience_id, new Set())
        }
        expAttrs.get(attr.experience_id)!.add(`${attr.attribute_key}:${attr.attribute_value}`)
      })

      // Find co-occurrences
      expAttrs.forEach((attrs, expId) => {
        const attrArray = Array.from(attrs)
        for (let i = 0; i < attrArray.length; i++) {
          for (let j = i + 1; j < attrArray.length; j++) {
            const key = [attrArray[i], attrArray[j]].sort().join('|||')
            if (!attrPairs.has(key)) {
              attrPairs.set(key, {count: 0, exps: new Set()})
            }
            const pair = attrPairs.get(key)!
            pair.count++
            pair.exps.add(expId)
          }
        }
      })

      // Convert to correlation objects (top 50)
      const sortedPairs = Array.from(attrPairs.entries())
        .filter(([_, data]) => data.count >= 3)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 50)

      sortedPairs.forEach(([key, data]) => {
        const [attr1, attr2] = key.split('|||')
        const [key1, val1] = attr1.split(':')
        const [key2, val2] = attr2.split(':')

        correlations.push({
          attribute1: val1,
          attribute2: val2,
          attribute1_key: key1,
          attribute2_key: key2,
          co_occurrence_count: data.count,
          correlation_coefficient: data.count / expAttrs.size,
        })
      })
    }

    // === RETURN COMPREHENSIVE ANALYTICS ===
    return NextResponse.json({
      geographic_analysis: {
        clusters,
        total_experiences: geoExperiences?.length || 0,
      },
      temporal_analysis: {
        timeline: timelineData,
        spikes,
        current_experience_date: currentExperienceDate,
        total_experiences: timelineExperiences?.length || 0,
      },
      attribute_analysis: {
        correlations,
        total_attributes: attributeData?.length || 0,
      },
    })
  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}
