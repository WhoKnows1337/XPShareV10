'use client'

/**
 * User Comparison Modal Component
 *
 * Side-by-side comparison of two user profiles (XP Twins)
 * Shows similarities and differences in XP DNA
 *
 * Features:
 * - Category distribution comparison
 * - Shared categories highlight
 * - Level/XP comparison
 * - Visual similarity gauge
 * - Connect button
 */

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Sparkles, Trophy, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface CategoryStat {
  category: string
  percentage: number
  count: number
}

interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  total_xp: number
  level: number
  categoryStats: CategoryStat[]
}

interface UserComparisonModalProps {
  /**
   * Whether modal is open
   */
  open: boolean

  /**
   * Close handler
   */
  onClose: () => void

  /**
   * Current user profile
   */
  currentUser: UserProfile

  /**
   * Comparison user profile (XP Twin)
   */
  comparisonUser: UserProfile

  /**
   * Similarity score (0.0 - 1.0)
   */
  similarityScore: number

  /**
   * Shared categories
   */
  sharedCategories: string[]

  /**
   * Connect handler
   */
  onConnect?: () => void
}

export function UserComparisonModal({
  open,
  onClose,
  currentUser,
  comparisonUser,
  similarityScore,
  sharedCategories,
  onConnect
}: UserComparisonModalProps) {
  const similarityPercentage = Math.round(similarityScore * 100)

  // Get top 5 categories for each user
  const currentTopCategories = currentUser.categoryStats.slice(0, 5)
  const comparisonTopCategories = comparisonUser.categoryStats.slice(0, 5)

  // Combine and deduplicate categories for comparison
  const allCategories = Array.from(
    new Set([
      ...currentTopCategories.map(c => c.category),
      ...comparisonTopCategories.map(c => c.category)
    ])
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            XP Twin Comparison
          </DialogTitle>
          <DialogDescription>
            Side-by-side comparison of experience profiles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Similarity Score */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <div className="text-4xl font-bold text-purple-600">
                {similarityPercentage}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Similarity Match</p>
            <Progress
              value={similarityPercentage}
              className="mt-4 h-2 max-w-md mx-auto [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-blue-600"
            />
          </motion.div>

          {/* User Profiles */}
          <div className="grid grid-cols-2 gap-6">
            {/* Current User */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentUser.avatar_url || ''} />
                  <AvatarFallback>
                    {(currentUser.display_name || currentUser.username || 'You')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {currentUser.display_name || currentUser.username || 'You'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Your Profile</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Level</span>
                  </div>
                  <div className="text-xl font-bold">{currentUser.level}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Total XP</span>
                  </div>
                  <div className="text-xl font-bold">{currentUser.total_xp.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Comparison User */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={comparisonUser.avatar_url || ''} />
                  <AvatarFallback>
                    {(comparisonUser.display_name || comparisonUser.username || 'User')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {comparisonUser.display_name || comparisonUser.username || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">XP Twin</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Level</span>
                  </div>
                  <div className="text-xl font-bold">{comparisonUser.level}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Total XP</span>
                  </div>
                  <div className="text-xl font-bold">{comparisonUser.total_xp.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Comparison */}
          <div>
            <h4 className="font-semibold mb-4">XP DNA Comparison</h4>
            <div className="space-y-3">
              {allCategories.map(category => {
                const currentStat = currentUser.categoryStats.find(c => c.category === category)
                const comparisonStat = comparisonUser.categoryStats.find(c => c.category === category)
                const isShared = sharedCategories.includes(category)

                return (
                  <div
                    key={category}
                    className={`p-3 rounded-lg border ${isShared ? 'border-primary/50 bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/-/g, ' ')}
                        </span>
                        {isShared && (
                          <Badge variant="secondary" className="text-xs">
                            Shared
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">You</span>
                          <span className="font-medium">
                            {currentStat ? `${currentStat.percentage.toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                        <Progress
                          value={currentStat?.percentage || 0}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Twin</span>
                          <span className="font-medium">
                            {comparisonStat ? `${comparisonStat.percentage.toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                        <Progress
                          value={comparisonStat?.percentage || 0}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Connect Button */}
          {onConnect && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onConnect}>
                <Users className="mr-2 h-4 w-4" />
                Connect with Twin
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
