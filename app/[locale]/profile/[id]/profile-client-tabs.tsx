'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  MapPin,
  Calendar,
  FileText,
  Trophy,
  Globe
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import { UserStats } from '@/components/profile/user-stats'
import { BadgesShowcase } from '@/components/profile/badges-showcase'
import { ProfileBadges } from './tabs/profile-badges'
import { GlobalImpactDashboard } from '@/components/profile/global-impact-dashboard'

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

            {/* Edit Button */}
            {isOwnProfile && (
              <Link href={`/settings`}>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                  Edit Profile
                </Button>
              </Link>
            )}
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="experiences">
            Experiences ({stats.experiencesCount})
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Trophy className="h-4 w-4 mr-2" />
            Badges ({badges.length})
          </TabsTrigger>
          <TabsTrigger value="impact">
            <Globe className="h-4 w-4 mr-2" />
            Impact
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Badges Showcase */}
            <BadgesShowcase
              userBadges={badges.map((ub: any) => ({
                id: ub.badges?.id || ub.id,
                name: ub.badges?.name || ub.name,
                description: ub.badges?.description || ub.description,
                icon: ub.badges?.icon || ub.icon,
                rarity: ub.badges?.rarity || ub.rarity,
                xp_reward: ub.badges?.xp_reward || ub.xp_reward,
                earned_at: ub.earned_at,
              }))}
              totalXP={totalXP}
            />

            {/* Recent Experiences */}
            {experiences && experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Experiences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experiences.map((exp: any) => (
                      <Link
                        key={exp.id}
                        href={`/experiences/${exp.id}`}
                        className="block rounded-lg border p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{exp.title}</h3>
                            <Badge variant="outline" className="mt-1">
                              {exp.category}
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-600">
                            {format(new Date(exp.created_at), 'dd. MMM yyyy', { locale: de })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Experiences Tab */}
        <TabsContent value="experiences">
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-muted-foreground">
                Full experiences list coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <ProfileBadges userId={profileUser.id} badges={badges} />
        </TabsContent>

        {/* Impact Tab */}
        <TabsContent value="impact">
          <GlobalImpactDashboard userId={profileUser.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
