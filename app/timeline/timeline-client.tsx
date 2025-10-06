'use client'

import { useState, useEffect } from 'react'
import { TimelineView } from '@/components/timeline/timeline-view'
import { TimelineFilters } from '@/components/timeline/timeline-filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface TimelineExperience {
  id: string
  title: string
  story_text: string
  category: string
  tags: string[]
  location_text?: string
  date_occurred?: string
  time_of_day?: string
  view_count: number
  upvote_count: number
  comment_count: number
  created_at: string
  user_profiles?: {
    username: string
    display_name: string
    avatar_url?: string
  } | null
}

interface TimelineClientProps {
  initialExperiences: TimelineExperience[]
  initialCategory: string
  totalCount: number
}

export function TimelineClient({ initialExperiences, initialCategory, totalCount }: TimelineClientProps) {
  const [experiences, setExperiences] = useState<TimelineExperience[]>(initialExperiences)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialExperiences.length < totalCount)
  const [offset, setOffset] = useState(initialExperiences.length)

  // Reset when category changes
  useEffect(() => {
    setExperiences(initialExperiences)
    setOffset(initialExperiences.length)
    setHasMore(initialExperiences.length < totalCount)
  }, [initialCategory, initialExperiences, totalCount])

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: offset.toString(),
      })

      if (initialCategory && initialCategory !== 'all') {
        params.set('category', initialCategory)
      }

      const response = await fetch(`/api/patterns/timeline?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setExperiences((prev) => [...prev, ...data.experiences])
        setOffset((prev) => prev + data.experiences.length)
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Failed to load more experiences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Experience Timeline</h1>
            <p className="text-muted-foreground">
              Journey through extraordinary experiences in chronological order
            </p>
          </div>
          <Link href="/feed">
            <Button variant="outline">Back to Feed</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{totalCount} total experiences</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <TimelineFilters />
      </div>

      {/* Timeline */}
      {experiences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Experiences Found</h3>
            <p className="text-sm text-slate-600 mb-4">
              No experiences found for the selected category.
            </p>
            <Link href="/submit">
              <Button>Share Your First Experience</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <TimelineView experiences={experiences} />

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 text-center">
              <Button
                onClick={loadMore}
                disabled={isLoading}
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Load More
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Showing {experiences.length} of {totalCount}
              </p>
            </div>
          )}

          {!hasMore && experiences.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                You've reached the beginning of time ✨
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
