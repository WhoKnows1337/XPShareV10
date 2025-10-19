'use client'

import { useEffect, useState } from 'react'
import { ExperienceMap } from '@/components/profile/experience-map'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface ExperienceLocation {
  id: string
  title: string
  category: string
  latitude: number
  longitude: number
  date: string
}

export function StatsTab({ userId }: { userId: string }) {
  const [experiences, setExperiences] = useState<ExperienceLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await fetch(`/api/users/${userId}/experiences?withLocation=true`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()

        // Filter experiences that have valid location data
        const withLocation = (data.experiences || []).filter(
          (exp: any) => exp.location_lat != null && exp.location_long != null
        ).map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          category: exp.category,
          latitude: exp.location_lat,
          longitude: exp.location_long,
          date: exp.created_at
        }))

        setExperiences(withLocation)
      } catch (err) {
        console.error('Error fetching experiences:', err)
        setExperiences([])
      } finally {
        setLoading(false)
      }
    }
    fetchExperiences()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Geographic Experience Map */}
      <ExperienceMap
        experiences={experiences}
        height={500}
        title="Experience Locations"
        enableClustering={true}
        enableHeatmap={false}
        showCategoryFilter={true}
      />

      {/* TODO: Add more stat visualizations */}
      {/* - Category breakdown chart (already in main profile) */}
      {/* - Experience timeline */}
      {/* - Collaboration network graph */}
    </div>
  )
}
