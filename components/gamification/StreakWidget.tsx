'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, TrendingUp, Calendar, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string
  total_experiences: number
  total_comments: number
  total_reactions: number
}

interface StreakWidgetProps {
  userId?: string
  compact?: boolean
  className?: string
}

export function StreakWidget({ userId, compact = false, className }: StreakWidgetProps) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreak()
  }, [userId])

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/gamification/streak')
      if (response.ok) {
        const data = await response.json()
        setStreak(data)
      }
    } catch (error) {
      console.error('Failed to fetch streak:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="pt-6">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!streak) return null

  const streakDays = streak.current_streak || 0
  const isHotStreak = streakDays >= 7
  const isOnFire = streakDays >= 30

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <motion.div
          animate={isOnFire ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Flame
            className={cn(
              'h-5 w-5',
              isOnFire
                ? 'text-orange-500'
                : isHotStreak
                ? 'text-yellow-500'
                : 'text-muted-foreground'
            )}
          />
        </motion.div>
        <span className="font-bold text-lg">{streakDays}</span>
        <span className="text-sm text-muted-foreground">Tage</span>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isOnFire ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flame
                className={cn(
                  'h-6 w-6',
                  isOnFire
                    ? 'text-orange-500'
                    : isHotStreak
                    ? 'text-yellow-500'
                    : 'text-muted-foreground'
                )}
              />
            </motion.div>
            <CardTitle>Deine Streak</CardTitle>
          </div>
          {isOnFire && (
            <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-red-500">
              🔥 On Fire!
            </Badge>
          )}
          {isHotStreak && !isOnFire && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
              Hot Streak
            </Badge>
          )}
        </div>
        <CardDescription>Bleib aktiv und halte deine Streak am Leben!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="text-center py-4">
          <motion.div
            key={streakDays}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="text-6xl font-bold bg-gradient-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {streakDays}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Tag{streakDays !== 1 ? 'e' : ''} in Folge
            </p>
          </motion.div>
        </div>

        {/* Calendar visualization */}
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: Math.min(streakDays, 7) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'h-8 w-8 rounded border-2 flex items-center justify-center',
                i === Math.min(streakDays, 7) - 1
                  ? 'bg-gradient-to-br from-orange-500 to-pink-500 border-orange-500'
                  : 'bg-green-500/20 border-green-500'
              )}
            >
              {i === Math.min(streakDays, 7) - 1 ? (
                <Zap className="h-4 w-4 text-white" />
              ) : (
                <span className="text-xs">✓</span>
              )}
            </motion.div>
          ))}
          {streakDays > 7 && (
            <Badge variant="secondary" className="text-xs">
              +{streakDays - 7}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <p className="text-2xl font-bold">{streak.longest_streak}</p>
            </div>
            <p className="text-xs text-muted-foreground">Längste</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-blue-500" />
              <p className="text-2xl font-bold">{streak.total_experiences}</p>
            </div>
            <p className="text-xs text-muted-foreground">Erfahrungen</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold">{streak.total_comments + streak.total_reactions}</p>
            </div>
            <p className="text-xs text-muted-foreground">Interaktionen</p>
          </div>
        </div>

        {/* Motivation */}
        {streakDays > 0 && (
          <div className="text-center text-sm text-muted-foreground italic">
            {getMotivationMessage(streakDays)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getMotivationMessage(days: number): string {
  if (days >= 100) return '💯 Jahrhundert-Streak! Du bist eine Legende!'
  if (days >= 50) return '⭐ 50 Tage! Unglaubliche Disziplin!'
  if (days >= 30) return '🔥 Ein ganzer Monat! Du bist on fire!'
  if (days >= 14) return '💪 Zwei Wochen stark! Weiter so!'
  if (days >= 7) return '✨ Eine Woche geschafft! Großartig!'
  if (days >= 3) return '🚀 Toller Start! Bleib dran!'
  return '👍 Mach weiter so!'
}
