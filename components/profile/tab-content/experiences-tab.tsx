'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Filter, Calendar, MapPin, Eye, FileText, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'

interface ExperiencesTabProps {
  userId: string
  isOwnProfile: boolean
}

interface Experience {
  id: string
  title: string
  category: string
  date_occurred: string
  location_text?: string
  visibility: string
  created_at: string
  view_count?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  'ufo-uap': 'bg-purple-100 text-purple-700',
  'nde-obe': 'bg-blue-100 text-blue-700',
  'dreams': 'bg-cyan-100 text-cyan-700',
  'psychedelics': 'bg-pink-100 text-pink-700',
  'paranormal-anomalies': 'bg-red-100 text-red-700',
  'synchronicity': 'bg-orange-100 text-orange-700',
  'ghosts-spirits': 'bg-indigo-100 text-indigo-700',
  'altered-states': 'bg-violet-100 text-violet-700',
  'glitch-matrix': 'bg-green-100 text-green-700',
  'prophecy-premonition': 'bg-amber-100 text-amber-700',
}

export function ExperiencesTab({ userId, isOwnProfile }: ExperiencesTabProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          user_id: userId,
          visibility: 'public',
          sort_by: sortBy,
          ...(categoryFilter !== 'all' && { category: categoryFilter }),
          ...(searchQuery && { search: searchQuery }),
        })

        const response = await fetch(`/api/experiences?${params}`)
        if (!response.ok) throw new Error('Failed to fetch experiences')

        const data = await response.json()
        setExperiences(data.experiences || [])
      } catch (error) {
        console.error('Experiences fetch error:', error)
        toast.error('Failed to load experiences')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperiences()
  }, [userId, categoryFilter, sortBy, searchQuery])

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="date_occurred">By Date Occurred</SelectItem>
                <SelectItem value="view_count">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Experience Grid */}
      {experiences.length === 0 ? (
        <EmptyState
          icon={searchQuery || categoryFilter !== 'all' ? Search : isOwnProfile ? Sparkles : FileText}
          title={
            searchQuery || categoryFilter !== 'all'
              ? 'No experiences found'
              : isOwnProfile
              ? 'Share your first experience'
              : 'No public experiences yet'
          }
          description={
            searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your filters or search query to find experiences.'
              : isOwnProfile
              ? 'Start building your XP profile by sharing your first extraordinary experience with the community.'
              : 'This user hasn\'t shared any public experiences yet. Check back later!'
          }
          actionLabel={isOwnProfile && !searchQuery && categoryFilter === 'all' ? 'Share Experience' : undefined}
          actionHref={isOwnProfile && !searchQuery && categoryFilter === 'all' ? '/submit' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((exp) => (
            <Link key={exp.id} href={`/experiences/${exp.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={CATEGORY_COLORS[exp.category] || 'bg-gray-100'}>
                      {getCategoryLabel(exp.category)}
                    </Badge>
                    {exp.view_count && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{exp.view_count}</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{exp.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(exp.date_occurred), 'MMM yyyy', { locale: de })}
                      </span>
                    </div>
                    {exp.location_text && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{exp.location_text}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Total Count */}
      {experiences.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
