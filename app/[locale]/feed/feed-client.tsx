'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { ExperienceListView } from '@/components/experience/experience-list-view'
import { MapView } from '@/components/browse/map-view'
import { TimelineView } from '@/components/browse/timeline-view'
import { BentoGrid } from '@/components/ui/bento-grid'
import { cn } from '@/lib/utils'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { FeedLeftSidebar } from '@/components/browse/feed-left-sidebar'
import { FeedRightPanel } from '@/components/browse/feed-right-panel'
import { FeedTabs } from '@/components/browse/feed-tabs'
import { AchievementFeed } from '@/components/achievements/achievement-feed'
import { ViewSwitcher, ViewMode } from '@/components/browse/view-switcher'
import { MobileFilterSheet } from '@/components/browse/mobile-filter-sheet'
import { PullToRefresh } from '@/components/browse/pull-to-refresh'

interface Experience {
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

interface TrendingExperience {
  id: string
  title: string
  category: string
  upvote_count: number
  comment_count: number
  view_count: number
}

interface FeedClientProps {
  userName: string
  currentUserId: string
  experiences: Experience[]
  trendingExperiences: TrendingExperience[]
  category?: string
}

export function FeedClient({
  userName,
  currentUserId,
  experiences,
  trendingExperiences,
  category,
}: FeedClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get('tab') || 'for-you'
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const handleRefresh = async () => {
    router.refresh()
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return (
    <ThreeColumnLayout
      leftSidebar={
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <FeedLeftSidebar />
          </div>
          {/* Mobile Filter Button */}
          <div className="md:hidden">
            <MobileFilterSheet />
          </div>
        </>
      }
      rightPanel={<FeedRightPanel currentUserId={currentUserId} trendingExperiences={trendingExperiences} />}
      mainContent={
        <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">Welcome back, {userName}!</h1>
            <p className="text-slate-600">Discover and share extraordinary experiences</p>
          </div>

          {/* Feed Tabs */}
          <FeedTabs />

          {/* Conditional Content based on Tab */}
          {currentTab === 'achievements' ? (
            <AchievementFeed />
          ) : (
            <>
              {/* Feed Controls */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {category && category !== 'all'
                      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Experiences`
                      : 'Recent Experiences'}
                  </h2>
                  {experiences && experiences.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
              </div>

              {/* Experiences Grid */}
              {!experiences || experiences.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Sparkles className="mb-4 h-12 w-12 text-slate-300" aria-hidden="true" />
                      <h3 className="mb-2 text-lg font-semibold text-slate-700">
                        No experiences yet
                      </h3>
                      <p className="mb-6 text-sm text-slate-600">
                        Be the first to share an extraordinary experience!
                      </p>
                      <Link href="/submit">
                        <Button>Share Your First Experience</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : viewMode === 'list' ? (
                <ExperienceListView experiences={experiences} />
              ) : viewMode === 'map' ? (
                <MapView experiences={experiences} />
              ) : viewMode === 'timeline' ? (
                <TimelineView experiences={experiences} />
              ) : (
                <BentoGrid className="max-w-full">
                  {experiences.map((experience: Experience, index: number) => (
                    <EnhancedExperienceCard
                      key={experience.id}
                      experience={experience}
                      size={
                        index === 0
                          ? 'large'
                          : index === 2
                            ? 'wide'
                            : index % 7 === 0
                              ? 'large'
                              : 'default'
                      }
                      className={cn(
                        index === 0 && 'md:col-span-2',
                        index === 2 && 'md:row-span-2',
                        index % 7 === 0 && 'md:col-span-2'
                      )}
                    />
                  ))}
                </BentoGrid>
              )}
            </>
          )}
        </div>
      </PullToRefresh>
      }
    />
  )
}
