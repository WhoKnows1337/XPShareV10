'use client'

/**
 * XP Twins Card Component
 *
 * Shows similarity with another user - XP Twin match
 * Only displayed when viewing OTHER users' profiles
 *
 * Features:
 * - Similarity percentage with visual progress bar
 * - Shared categories list
 * - Match quality badge
 * - Connect button
 */

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Sparkles, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface SharedExperience {
  id: string
  title: string
  category: string
  created_at: string
}

interface XPTwinsCardProps {
  similarity: {
    score: number // 0.0 - 1.0
    shared_categories: string[]
    match_quality: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR'
  }
  sharedExperiences?: SharedExperience[]
  onConnect?: () => void
  className?: string
}

const QUALITY_COLORS = {
  EXCELLENT: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  VERY_GOOD: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
  GOOD: 'bg-gradient-to-r from-green-600 to-teal-600 text-white',
  FAIR: 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white',
}

export function XPTwinsCard({ similarity, sharedExperiences = [], onConnect, className = '' }: XPTwinsCardProps) {
  const percentage = Math.round(similarity.score * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border-2 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              XP Twin Match
            </CardTitle>
            <Badge className={QUALITY_COLORS[similarity.match_quality]}>
              {similarity.match_quality.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Similarity Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Similarity</span>
              <span className="text-2xl font-bold text-primary">{percentage}%</span>
            </div>
            <Progress
              value={percentage}
              className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-blue-600"
            />
          </div>

          {/* Shared Categories */}
          {similarity.shared_categories && similarity.shared_categories.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Shared Categories ({similarity.shared_categories.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {similarity.shared_categories.slice(0, 5).map(category => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                {similarity.shared_categories.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{similarity.shared_categories.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Shared Experiences */}
          {sharedExperiences && sharedExperiences.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Shared Experiences ({sharedExperiences.length})
                </p>
              </div>
              <div className="space-y-2">
                {sharedExperiences.slice(0, 3).map(exp => (
                  <Link
                    key={exp.id}
                    href={`/experiences/${exp.id}`}
                    className="block p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{exp.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {exp.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(exp.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {sharedExperiences.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    +{sharedExperiences.length - 3} more shared {sharedExperiences.length - 3 === 1 ? 'experience' : 'experiences'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Connect Button */}
          {onConnect && (
            <Button
              onClick={onConnect}
              className="w-full"
              size="lg"
            >
              <Users className="mr-2 h-4 w-4" />
              Connect with XP Twin
            </Button>
          )}

          {/* Match Description */}
          <p className="text-xs text-muted-foreground text-center">
            {percentage >= 80 && 'You share very similar XP profiles!'}
            {percentage >= 60 && percentage < 80 && 'Strong overlap in experiences'}
            {percentage >= 40 && percentage < 60 && 'Notable pattern similarities'}
            {percentage < 40 && 'Some shared experience patterns'}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
