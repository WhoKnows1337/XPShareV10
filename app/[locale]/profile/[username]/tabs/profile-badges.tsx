'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Trophy, Lock, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface ProfileBadgesProps {
  userId: string
  badges: any[]
}

export function ProfileBadges({ userId, badges: initialBadges }: ProfileBadgesProps) {
  const [badges, setBadges] = useState(initialBadges)
  const [lockedBadges, setLockedBadges] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<any>(null)

  useEffect(() => {
    fetchLockedBadges()
    checkForNewBadges()
  }, [userId])

  const fetchLockedBadges = async () => {
    try {
      const response = await fetch(`/api/badges/locked?userId=${userId}`)
      const data = await response.json()
      setLockedBadges(data.badges || [])
    } catch (error) {
      console.error('Error fetching locked badges:', error)
    }
  }

  const checkForNewBadges = () => {
    const newBadgeId = sessionStorage.getItem('newlyUnlockedBadge')
    if (newBadgeId) {
      const badge = badges.find(b => b.badge_id === newBadgeId)
      if (badge) {
        setNewlyUnlockedBadge(badge)
        setShowUnlockAnimation(true)
        sessionStorage.removeItem('newlyUnlockedBadge')

        setTimeout(() => {
          setShowUnlockAnimation(false)
        }, 3000)
      }
    }
  }

  const sortedBadges = [...badges].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
      case 'rarity':
        return (a.badges?.rarity_percentage || 100) - (b.badges?.rarity_percentage || 100)
      case 'xp':
        return (b.badges?.xp_reward || 0) - (a.badges?.xp_reward || 0)
      default:
        return 0
    }
  })

  const filteredBadges = filterCategory === 'all'
    ? sortedBadges
    : sortedBadges.filter(b => b.badges?.category === filterCategory)

  const totalXP = badges.reduce((sum, b) => sum + (b.badges?.xp_reward || b.xp_reward || 0), 0)

  return (
    <div className="space-y-6">
      {/* Unlock Animation */}
      <AnimatePresence>
        {showUnlockAnimation && newlyUnlockedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="mb-4"
                >
                  <div className="text-6xl mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Badge Unlocked!</h2>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {newlyUnlockedBadge.badges.name || newlyUnlockedBadge.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {newlyUnlockedBadge.badges.description || newlyUnlockedBadge.description}
                </p>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  +{newlyUnlockedBadge.badges.xp_reward || newlyUnlockedBadge.xp_reward} XP
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Badges ({badges.length}/{badges.length + lockedBadges.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Total XP from Badges: {totalXP} XP
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pattern">Pattern</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
              <SelectItem value="xp">XP Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Unlocked Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Unlocked ({filteredBadges.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBadges.map((userBadge) => {
            const badge = userBadge.badges || userBadge
            return (
              <TooltipProvider key={userBadge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">
                            {badge.icon || '🏆'}
                          </div>
                          <p className="text-sm font-semibold line-clamp-2 mb-1">
                            {badge.name}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            +{badge.xp_reward} XP
                          </Badge>
                          {badge.rarity_percentage && badge.rarity_percentage < 10 && (
                            <Badge variant="outline" className="text-xs mt-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                              Rare {badge.rarity_percentage}%
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-sm">{badge.description}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>XP Reward:</strong> {badge.xp_reward}</p>
                        <p>
                          <strong>Unlocked:</strong>{' '}
                          {format(new Date(userBadge.earned_at), 'dd. MMMM yyyy', { locale: de })}
                        </p>
                        {badge.rarity_percentage && (
                          <p>
                            <strong>Rarity:</strong> Only {badge.rarity_percentage}% of users have this!
                          </p>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </div>

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Locked ({lockedBadges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {lockedBadges.map((badge) => (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="opacity-60 cursor-pointer hover:opacity-80 transition-opacity">
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2 filter grayscale">
                          {badge.icon || '🏆'}
                        </div>
                        <p className="text-sm font-semibold line-clamp-2 mb-2">
                          {badge.name}
                        </p>
                        {badge.progress !== undefined && (
                          <div className="space-y-1">
                            <Progress value={(badge.progress.current / badge.progress.required) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {badge.progress.current}/{badge.progress.required}
                            </p>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs mt-2">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-sm">{badge.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <p><strong>XP Reward:</strong> {badge.xp_reward}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
