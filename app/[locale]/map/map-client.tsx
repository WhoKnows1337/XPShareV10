'use client'

import { useState, useEffect } from 'react'
import { MapView } from '@/components/browse/map-view'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Map, Layers } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

interface MapClientProps {
  profile: {
    username: string
    display_name: string
  } | null
}

export function MapClient({ profile }: MapClientProps) {
  const t = useTranslations('map')
  const tCategories = useTranslations('categories')
  const [experiences, setExperiences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')

  // Fetch experiences with location data
  const fetchExperiences = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('experiences')
        .select(`
          id,
          title,
          story_text,
          category,
          date_occurred,
          created_at,
          location_lat,
          location_lng,
          location_text,
          view_count,
          user_profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('visibility', 'public')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('created_at', { ascending: false })
        .limit(500)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching experiences:', error)
      } else {
        console.log('Fetched experiences for map:', data?.length, data)
        setExperiences(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch experiences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and refetch when category changes
  useEffect(() => {
    fetchExperiences()
  }, [category])

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/feed">
            <Button variant="outline">
              {t('backToFeed')}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Map className="h-4 w-4" />
            <span>{t('locationsCount', { count: experiences.length })}</span>
          </div>
          {isLoading && (
            <Badge variant="secondary" className="animate-pulse">
              {t('loading')}
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="font-medium text-sm">{t('categoryFilter')}</span>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                <SelectItem value="ufo">🛸 {tCategories('ufo-uap')}</SelectItem>
                <SelectItem value="paranormal">👻 {tCategories('paranormal')}</SelectItem>
                <SelectItem value="dreams">💭 {tCategories('dreams')}</SelectItem>
                <SelectItem value="psychedelic">🌈 {tCategories('psychedelic')}</SelectItem>
                <SelectItem value="spiritual">✨ {tCategories('spiritual')}</SelectItem>
                <SelectItem value="synchronicity">🔄 {tCategories('synchronicity')}</SelectItem>
                <SelectItem value="nde">💫 {tCategories('nde')}</SelectItem>
                <SelectItem value="other">❓ {tCategories('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Map with Time-Travel */}
      <MapView experiences={experiences} />

      {/* Legend */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">{t('categoryLegend')}</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { category: 'ufo-uap', color: '#3b82f6' },
              { category: 'paranormal', color: '#8b5cf6' },
              { category: 'dreams', color: '#06b6d4' },
              { category: 'psychedelic', color: '#ec4899' },
              { category: 'spiritual', color: '#10b981' },
              { category: 'synchronicity', color: '#f59e0b' },
              { category: 'nde', color: '#ef4444' },
              { category: 'other', color: '#6b7280' },
            ].map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{tCategories(item.category)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!isLoading && experiences.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <Map className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('empty.title')}</h3>
            <p className="text-sm text-slate-600 mb-4">
              {t('empty.description')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('empty.hint')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
