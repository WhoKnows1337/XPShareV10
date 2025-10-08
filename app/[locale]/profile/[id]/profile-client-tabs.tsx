'use client'

import { useState } from 'react'
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
  totalContributions
}: ProfileClientTabsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = profileUser.display_name || profileUser.username

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
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="text-slate-600">@{profileUser.username}</p>

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

      {/* Stats */}
      <div className="mb-8">
        <UserStats
          totalXp={totalXP}
          level={level}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          totalExperiences={stats.experiencesCount}
          totalContributions={totalContributions}
        />
      </div>

      {/* Activity Chart */}
      <div className="mb-8">
        <ActivityChart userId={profileUser.id} />
      </div>

      {/* Profile Tabs - New 9-Tab System */}
      <ProfileTabs
        userId={profileUser.id}
        isOwnProfile={isOwnProfile}
        stats={{
          experiencesCount: stats.experiencesCount,
          draftsCount: stats.draftsCount,
          privateCount: stats.privateCount,
          badgesCount: badges.length,
        }}
      />
    </div>
  )
}
