'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  MapPin,
  Calendar,
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import { UserStats } from '@/components/profile/user-stats'
import { DownloadReportButton } from '@/components/profile/download-report-button'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { ActivityChart } from '@/components/profile/activity-chart'
import { StreakWidget } from '@/components/gamification/StreakWidget'
import { XPTwinsTabContent, XPDNABadge } from '@/components/profile/xp-twins'
import {
  ExperiencesTab,
  DraftsTab,
  PrivateTab,
  CommentsTab,
  LikedTab,
  CollaborationsTab,
  StatsTab,
  BadgesTab,
  ImpactTab,
} from '@/components/profile/tab-content'
import { EnhancedStatsGrid } from '@/components/profile/enhanced-stats-grid'
import { CategoryRadarChart } from '@/components/profile/category-radar-chart'
import { XPDNASpectrumBar } from '@/components/profile/xp-dna-spectrum-bar'
import { MobileActionBar } from '@/components/profile/mobile-action-bar'

interface ProfileClientTabsProps {
  profileUser: any
  currentUserId: string
  stats: {
    experiencesCount: number
    draftsCount: number
    privateCount: number
  }
  experiences: any[]
  badges: any[]
  isOwnProfile: boolean
  totalXP: number
  level: number
  currentStreak: number
  longestStreak: number
  totalContributions: number
  topCategories: string[]
  categoryDistribution: Record<string, number>
}

export function ProfileClientTabs({
  profileUser,
  currentUserId,
  stats,
  experiences,
  badges,
  isOwnProfile,
  totalXP,
  level,
  currentStreak,
  longestStreak,
  totalContributions,
  topCategories,
  categoryDistribution
}: ProfileClientTabsProps) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'experiences'

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = profileUser.display_name || profileUser.username

  // Render tab content based on current tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'experiences':
        return (
          <ExperiencesTab
            userId={profileUser.id}
            isOwnProfile={isOwnProfile}
          />
        )
      case 'drafts':
        return isOwnProfile ? (
          <DraftsTab userId={profileUser.id} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                This user's drafts are private
              </p>
            </CardContent>
          </Card>
        )
      case 'private':
        return isOwnProfile ? (
          <PrivateTab userId={profileUser.id} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                This user's private experiences are not visible
              </p>
            </CardContent>
          </Card>
        )
      case 'comments':
        return <CommentsTab userId={profileUser.id} />
      case 'liked':
        return (
          <LikedTab
            userId={profileUser.id}
            isOwnProfile={isOwnProfile}
          />
        )
      case 'collaborations':
        return <CollaborationsTab userId={profileUser.id} />
      case 'stats':
        return <StatsTab userId={profileUser.id} />
      case 'badges':
        return <BadgesTab userId={profileUser.id} />
      case 'impact':
        return <ImpactTab userId={profileUser.id} />
      case 'xp-twins':
        return (
          <XPTwinsTabContent
            userId={profileUser.id}
            isOwnProfile={isOwnProfile}
          />
        )
      default:
        return (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} tab content coming soon...
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Avatar */}
            <Avatar className="h-32 w-32">
              <AvatarImage src={profileUser.avatar_url} alt={profileUser.username} />
              <AvatarFallback className="text-2xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2">
                <div>
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  <p className="text-slate-600">@{profileUser.username}</p>
                </div>

                {/* XP DNA Badge - only show if user has categories */}
                {topCategories.length > 0 && (
                  <XPDNABadge
                    topCategories={topCategories}
                    categoryDistribution={categoryDistribution}
                    size="lg"
                    showLabel={true}
                    className="mt-2 md:mt-0"
                  />
                )}
              </div>

              {profileUser.bio && (
                <p className="mt-2 text-slate-700">{profileUser.bio}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 md:justify-start">
                {(profileUser.location_city || profileUser.location_country) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {[profileUser.location_city, profileUser.location_country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>
                    Mitglied seit {format(new Date(profileUser.created_at), 'MMMM yyyy', { locale: de })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwnProfile && (
                <>
                  <DownloadReportButton
                    userId={profileUser.id}
                    userName={profileUser.username}
                  />
                  <Link href={`/settings`}>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                      Edit Profile
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Grid (6-8 cards) */}
      <div className="mb-8">
        <EnhancedStatsGrid
          totalXp={totalXP}
          level={level}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          totalExperiences={stats.experiencesCount}
          totalContributions={totalContributions}
        />
      </div>

      {/* XP DNA Spectrum Bar & Category Radar */}
      {Object.keys(categoryDistribution).length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <XPDNASpectrumBar categoryDistribution={categoryDistribution} />
          <CategoryRadarChart categoryDistribution={categoryDistribution} />
        </div>
      )}

      {/* Streak Widget and Activity Chart */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StreakWidget userId={profileUser.id} />
        <ActivityChart userId={profileUser.id} />
      </div>

      {/* Profile Tabs - New 9-Tab System */}
      <ProfileTabs
        userId={profileUser.id}
        isOwnProfile={isOwnProfile}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

      {/* Mobile Action Bar */}
      <MobileActionBar isOwnProfile={isOwnProfile} />
    </div>
  )
}
