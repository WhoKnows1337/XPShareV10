'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, TrendingUp, Flame, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Achievement {
  id: string
  type: 'badge_earned' | 'level_up' | 'streak_milestone'
  title: string
  message: string
  created_at: string
  data?: {
    badge_name?: string
    badge_id?: string
    xp_reward?: number
    old_level?: number
    new_level?: number
    level_name?: string
    streak_days?: number
  }
  user_profiles?: {
    username: string
    display_name: string
    avatar_url?: string
  }
}

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'badge_earned':
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 'level_up':
      return <TrendingUp className="h-5 w-5 text-blue-500" />
    case 'streak_milestone':
      return <Flame className="h-5 w-5 text-orange-500" />
    default:
      return <Sparkles className="h-5 w-5 text-purple-500" />
  }
}

const getAchievementColor = (type: string) => {
  switch (type) {
    case 'badge_earned':
      return 'bg-yellow-50 border-yellow-200'
    case 'level_up':
      return 'bg-blue-50 border-blue-200'
    case 'streak_milestone':
      return 'bg-orange-50 border-orange-200'
    default:
      return 'bg-purple-50 border-purple-200'
  }
}

export function AchievementFeed() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/achievements/feed?limit=20')
      const data = await response.json()

      if (response.ok) {
        setAchievements(data.achievements || [])
      } else {
        setError(data.error || 'Failed to load achievements')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching achievements:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-sm text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (achievements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Trophy className="mb-4 h-12 w-12 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-700">
              No achievements yet
            </h3>
            <p className="text-sm text-slate-600">
              Be the first to earn a badge or complete a milestone!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Community Achievements
        </h2>
        <Badge variant="secondary">{achievements.length} recent</Badge>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => {
          const displayName = achievement.user_profiles?.display_name ||
                             achievement.user_profiles?.username ||
                             'Anonymous'
          const username = achievement.user_profiles?.username || 'user'
          const avatar = achievement.user_profiles?.avatar_url

          return (
            <Card
              key={achievement.id}
              className={`border-2 transition-all hover:shadow-md ${getAchievementColor(achievement.type)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getAchievementIcon(achievement.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {avatar && <AvatarImage src={avatar} alt={displayName} />}
                        <AvatarFallback>
                          {displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          <span className="text-primary">@{username}</span>{' '}
                          {achievement.type === 'badge_earned' && (
                            <>
                              hat das <span className="font-bold">&quot;{achievement.data?.badge_name}&quot;</span>-Badge freigeschaltet!
                            </>
                          )}
                          {achievement.type === 'level_up' && (
                            <>
                              ist jetzt <span className="font-bold">Level {achievement.data?.new_level}</span>
                              {achievement.data?.level_name && (
                                <> - {achievement.data.level_name}</>
                              )}!
                            </>
                          )}
                          {achievement.type === 'streak_milestone' && (
                            <>
                              hat <span className="font-bold">{achievement.data?.streak_days}-Tage-Streak</span> erreicht! 🔥
                            </>
                          )}
                        </div>

                        {/* Additional info */}
                        {achievement.data?.xp_reward && (
                          <div className="text-xs text-muted-foreground mt-1">
                            +{achievement.data.xp_reward} XP
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(achievement.created_at), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {achievements.length >= 20 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={fetchAchievements}>
            Mehr laden...
          </Button>
        </div>
      )}
    </div>
  )
}
