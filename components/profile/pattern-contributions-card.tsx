'use client'

/**
 * Pattern Contributions Card Component
 *
 * Shows patterns discovered/contributed to by user
 * Highlights user's role in pattern matching ecosystem
 *
 * Features:
 * - List of patterns with contribution count
 * - Visual progress bars
 * - Top contributor badge
 * - Link to pattern detail pages
 */

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkles, TrendingUp, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface PatternContribution {
  pattern_id: string
  pattern_name: string
  pattern_type: 'temporal' | 'geographic' | 'cross-category' | 'tag-based'
  contribution_count: number
  total_experiences: number
  first_contributed: string
  is_top_contributor: boolean
}

interface PatternContributionsCardProps {
  /**
   * Array of pattern contributions
   */
  contributions: PatternContribution[]

  /**
   * Total patterns discovered
   */
  totalPatterns: number

  /**
   * Card title
   */
  title?: string

  /**
   * Maximum patterns to show (rest collapsed)
   */
  maxVisible?: number

  /**
   * Additional className
   */
  className?: string
}

const PATTERN_TYPE_LABELS: Record<string, string> = {
  'temporal': 'Temporal',
  'geographic': 'Geographic',
  'cross-category': 'Cross-Category',
  'tag-based': 'Tag Network'
}

const PATTERN_TYPE_COLORS: Record<string, string> = {
  'temporal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'geographic': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'cross-category': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'tag-based': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

export function PatternContributionsCard({
  contributions,
  totalPatterns,
  title = 'Pattern Contributions',
  maxVisible = 5,
  className = ''
}: PatternContributionsCardProps) {
  const [showAll, setShowAll] = React.useState(false)

  const visibleContributions = showAll
    ? contributions
    : contributions.slice(0, maxVisible)

  const topContributorCount = contributions.filter(c => c.is_top_contributor).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-2xl font-bold">{totalPatterns}</div>
              <div className="text-xs text-muted-foreground">Patterns</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Top Contributor Badge */}
        {topContributorCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800"
          >
            <Award className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-sm">Top Contributor</p>
              <p className="text-xs text-muted-foreground">
                Leading contributor in {topContributorCount} {topContributorCount === 1 ? 'pattern' : 'patterns'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Pattern List */}
        {visibleContributions.length > 0 ? (
          <div className="space-y-3">
            {visibleContributions.map((contribution, index) => (
              <motion.div
                key={contribution.pattern_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Pattern Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/patterns/${contribution.pattern_id}`}
                        className="font-medium text-sm hover:text-primary transition-colors truncate"
                      >
                        {contribution.pattern_name}
                      </Link>
                      {contribution.is_top_contributor && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Top
                        </Badge>
                      )}
                    </div>

                    {/* Pattern Type Badge */}
                    <Badge
                      variant="outline"
                      className={`text-xs mb-2 ${PATTERN_TYPE_COLORS[contribution.pattern_type] || ''}`}
                    >
                      {PATTERN_TYPE_LABELS[contribution.pattern_type] || contribution.pattern_type}
                    </Badge>

                    {/* Contribution Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {contribution.contribution_count} of {contribution.total_experiences} experiences
                        </span>
                        <span className="font-medium">
                          {Math.round((contribution.contribution_count / contribution.total_experiences) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(contribution.contribution_count / contribution.total_experiences) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* First Contributed Date */}
                    <p className="text-xs text-muted-foreground mt-2">
                      First contributed: {new Date(contribution.first_contributed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No pattern contributions yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Share more experiences to discover patterns
            </p>
          </div>
        )}

        {/* Show More Button */}
        {contributions.length > maxVisible && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {showAll
              ? 'Show Less'
              : `Show ${contributions.length - maxVisible} More ${contributions.length - maxVisible === 1 ? 'Pattern' : 'Patterns'}`
            }
          </button>
        )}
      </CardContent>
    </Card>
  )
}
