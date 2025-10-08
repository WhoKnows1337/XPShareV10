'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Lock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { calculateLevel, getLevelTitle, getLevelColor } from '@/lib/utils/xp-calculator'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xp_reward: number
  earned_at?: string
}

interface BadgesShowcaseProps {
  userBadges: BadgeData[]
  totalXP: number
}

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-300 bg-blue-50',
  epic: 'border-purple-300 bg-purple-50',
  legendary: 'border-yellow-300 bg-yellow-50',
}

const rarityTextColors = {
  common: 'text-gray-700',
  rare: 'text-blue-700',
  epic: 'text-purple-700',
  legendary: 'text-yellow-700',
}

export function BadgesShowcase({ userBadges, totalXP }: BadgesShowcaseProps) {
  const levelInfo = calculateLevel(totalXP)
  const levelTitle = getLevelTitle(levelInfo.level)
  const levelColor = getLevelColor(levelInfo.level)
  const [hasShownConfetti, setHasShownConfetti] = useState(false)

  // Confetti for legendary badges
  useEffect(() => {
    if (!hasShownConfetti && userBadges.some(b => b.rarity === 'legendary')) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        })
        setHasShownConfetti(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [userBadges, hasShownConfetti])

  return (
    <div className="space-y-6">
      {/* XP Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${levelColor}`} />
            Level {levelInfo.level} - {levelTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {levelInfo.xpProgress} / {levelInfo.xpForNextLevel - levelInfo.xpForCurrentLevel} XP
              </span>
              <span className="font-medium">{levelInfo.xpProgressPercent}%</span>
            </div>
            <Progress value={levelInfo.xpProgressPercent} className="h-3" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
            <div>
              <p className="text-sm font-medium text-purple-900">Total XP</p>
              <p className="text-xs text-purple-700">All-time progress</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{totalXP}</p>
          </div>
        </CardContent>
      </Card>

      {/* Badges Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Badges Earned</span>
            <Badge variant="secondary">{userBadges.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No badges earned yet. Complete activities to earn your first badge!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {userBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotate: badge.rarity === 'legendary' ? [0, -2, 2, -2, 0] : 0,
                    transition: { duration: 0.3 }
                  }}
                  className={`rounded-lg border-2 p-4 transition-all hover:shadow-md cursor-pointer ${
                    rarityColors[badge.rarity]
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${rarityTextColors[badge.rarity]}`}>
                        {badge.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {badge.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {badge.rarity}
                        </Badge>
                        <span className="text-xs font-medium text-purple-600">
                          +{badge.xp_reward} XP
                        </span>
                      </div>
                      {badge.earned_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned {new Date(badge.earned_at).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
