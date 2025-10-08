'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Trophy,
  Zap,
  TrendingUp,
  Users,
  Share2,
  Heart,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { WaveCreationBadge } from '@/components/animations/WaveCreationBadge'

interface EarnedBadge {
  badge: {
    id: string
    name: string
    description: string
    icon: string
    xp_reward: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }
  xpGained: number
  totalXP: number
}

interface BadgeResponse {
  success: boolean
  earnedBadges: EarnedBadge[]
  count: number
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600',
}

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id')
  const [showConfetti, setShowConfetti] = useState(true)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [showBadges, setShowBadges] = useState(false)
  const [patternData, setPatternData] = useState<{
    patternName: string
    matchCount: number
    category: string
  } | null>(null)
  const [reactions, setReactions] = useState({
    likes: Math.floor(Math.random() * 10),
    comments: Math.floor(Math.random() * 5),
    shares: Math.floor(Math.random() * 3),
  })

  useEffect(() => {
    // Get earned badges from localStorage
    const storedBadges = localStorage.getItem('earned_badges')
    if (storedBadges) {
      try {
        const badgeData: BadgeResponse = JSON.parse(storedBadges)
        if (badgeData.earnedBadges && badgeData.earnedBadges.length > 0) {
          setEarnedBadges(badgeData.earnedBadges)
          setTotalXP(badgeData.earnedBadges[0]?.totalXP || 0)
          // Show badges after a short delay
          setTimeout(() => setShowBadges(true), 1000)
        }
        // Clean up
        localStorage.removeItem('earned_badges')
      } catch (err) {
        console.error('Failed to parse earned badges:', err)
      }
    }

    // Check for pattern matches
    const checkPatterns = async () => {
      if (!experienceId) return
      try {
        const response = await fetch(`/api/patterns/check?experienceId=${experienceId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.patternFound) {
            setPatternData({
              patternName: data.patternName,
              matchCount: data.matchCount,
              category: data.category,
            })
          }
        }
      } catch (err) {
        console.error('Pattern check error:', err)
      }
    }

    checkPatterns()

    // Clear draft from localStorage
    localStorage.removeItem('experience_draft')

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [experienceId])

  if (!experienceId) {
    router.push('/feed')
    return null
  }

  const totalXPGained = earnedBadges.reduce((sum, badge) => sum + badge.xpGained, 0)
  const currentLevel = Math.floor(totalXP / 100) + 1
  const xpInCurrentLevel = totalXP % 100
  const xpForNextLevel = 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * window.innerWidth, rotate: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 100,
                rotate: 720,
                opacity: 0,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 3,
                ease: 'linear',
              }}
              className="absolute"
            >
              <Sparkles
                className="h-6 w-6"
                style={{
                  color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full space-y-6">
          {/* Main Success Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-4"
                >
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">
                  Experience Shared Successfully! 🎉
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <p className="text-lg text-muted-foreground">
                  Thank you for sharing your extraordinary experience with the community.
                  Your story is now part of the collective tapestry of human experiences.
                </p>

                {/* XP Gained Summary */}
                {totalXPGained > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20"
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Zap className="h-6 w-6 text-yellow-500" />
                      <span className="text-3xl font-bold text-purple-600">
                        +{totalXPGained} XP
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Level {currentLevel} • {xpInCurrentLevel}/{xpForNextLevel} XP to next level
                    </p>
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(xpInCurrentLevel / xpForNextLevel) * 100}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3 pt-4">
                  <Link href={`/experiences/${experienceId}`}>
                    <Button size="lg" className="w-full">
                      View Your Experience
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="/feed">
                    <Button variant="outline" size="lg" className="w-full">
                      Explore Other Experiences
                    </Button>
                  </Link>

                  <Link href="/submit">
                    <Button variant="ghost" size="lg" className="w-full">
                      Share Another Experience
                    </Button>
                  </Link>
                </div>

                <div className="pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    Your experience will be visible to the community and may help others
                    discover patterns and connections.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pattern Match (Wave Creation) */}
          <AnimatePresence>
            {patternData && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ delay: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <WaveCreationBadge
                  patternName={patternData.patternName}
                  matchCount={patternData.matchCount}
                  category={patternData.category}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badges Earned */}
          <AnimatePresence>
            {showBadges && earnedBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ delay: 0.8 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      🎖️ Badges Earned!
                    </CardTitle>
                    <CardDescription>
                      You unlocked {earnedBadges.length} new{' '}
                      {earnedBadges.length === 1 ? 'badge' : 'badges'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {earnedBadges.map((earnedBadge, index) => (
                        <motion.div
                          key={earnedBadge.badge.id}
                          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                          transition={{
                            delay: 1 + index * 0.2,
                            type: 'spring',
                            stiffness: 200,
                          }}
                          className="relative overflow-hidden"
                        >
                          <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-border bg-card">
                            {/* Badge Icon */}
                            <div
                              className={`h-16 w-16 rounded-full bg-gradient-to-br ${
                                rarityColors[earnedBadge.badge.rarity]
                              } flex items-center justify-center text-3xl shadow-lg`}
                            >
                              {earnedBadge.badge.icon}
                            </div>

                            {/* Badge Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg">
                                  {earnedBadge.badge.name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className="capitalize text-xs"
                                >
                                  {earnedBadge.badge.rarity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {earnedBadge.badge.description}
                              </p>
                              <div className="flex items-center gap-2 text-sm">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-yellow-600">
                                  +{earnedBadge.badge.xp_reward} XP
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Shine Effect */}
                          <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{
                              delay: 1 + index * 0.2 + 0.5,
                              duration: 0.8,
                            }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instant Reactions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schnellreaktionen</CardTitle>
                <CardDescription>Gib deiner eigenen Erfahrung eine erste Reaktion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setReactions((r) => ({ ...r, likes: r.likes + 1 }))}
                  >
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    {reactions.likes}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setReactions((r) => ({ ...r, shares: r.shares + 1 }))}
                  >
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500" />
                    {reactions.shares}
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                    {reactions.comments}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{totalXP}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{earnedBadges.length}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{patternData?.matchCount || '0'}</p>
                  <p className="text-xs text-muted-foreground">Ähnliche</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{reactions.likes}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="h-5 w-5 text-blue-500" />
                  Share Your Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Let others know about your contribution to the collective knowledge
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
