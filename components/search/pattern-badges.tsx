'use client'

import { motion } from 'framer-motion'
import { Sparkles, MapPin, Moon, Link2, GitBranch, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/**
 * Pattern Badge Types
 */
export type PatternType = 'temporal' | 'geographic' | 'tag_network' | 'cross_category' | 'similarity'

/**
 * Pattern data from API
 */
export interface PatternData {
  temporal?: Array<{
    type: string
    emoji: string
    count: number
  }>
  geographic?: Array<{
    cluster_id: number
    count: number
    center: { lat: number; lng: number }
    radius_km: number
  }>
  tag_network?: Array<{
    tags: [string, string]
    count: number
    strength: number
  }>
  cross_category?: Array<{
    categories: [string, string]
    count: number
    type: string
  }>
  similarity?: number // 0-1 similarity score
}

interface PatternBadgesProps {
  patterns: PatternData
  compact?: boolean
  onClick?: (patternType: PatternType) => void
}

/**
 * PatternBadges Component
 *
 * Displays all 6 pattern types as visual badges:
 * 1. 🌕 Moon Phase (Temporal)
 * 2. 📍 Location Cluster (Geographic)
 * 3. 🔗 Tag Network
 * 4. 🌉 Category Bridge (Cross-Category)
 * 5. ✨ Similarity Score
 * 6. 📈 Pattern Strength (derived)
 *
 * Usage:
 * ```tsx
 * <PatternBadges
 *   patterns={experience.patterns}
 *   onClick={(type) => handlePatternClick(type)}
 * />
 * ```
 */
export function PatternBadges({ patterns, compact = false, onClick }: PatternBadgesProps) {
  if (!patterns) return null

  const hasTemporal = patterns.temporal && patterns.temporal.length > 0
  const hasGeographic = patterns.geographic && patterns.geographic.length > 0
  const hasTagNetwork = patterns.tag_network && patterns.tag_network.length > 0
  const hasCrossCategory = patterns.cross_category && patterns.cross_category.length > 0
  const hasSimilarity = patterns.similarity !== undefined && patterns.similarity > 0

  const hasAnyPattern = hasTemporal || hasGeographic || hasTagNetwork || hasCrossCategory || hasSimilarity

  if (!hasAnyPattern) return null

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? 'gap-1' : ''}`}>
      {/* 1. TEMPORAL PATTERN - Moon Phase */}
      {hasTemporal && patterns.temporal!.map((temporal, idx) => (
        <TooltipProvider key={`temporal-${idx}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onClick?.('temporal')}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full
                  bg-gradient-to-r from-purple-500/20 to-indigo-500/20
                  border border-purple-500/30
                  text-purple-200 hover:text-purple-100
                  transition-all cursor-pointer
                  ${compact ? 'text-xs' : 'text-sm'}
                `}
              >
                <span className="text-base">{temporal.emoji}</span>
                {!compact && <span className="font-medium">{temporal.count}</span>}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass-card border-glass-border">
              <p className="font-semibold text-purple-300">
                <Moon className="inline h-3 w-3 mr-1" />
                Temporal Echo
              </p>
              <p className="text-xs text-text-tertiary">
                {temporal.count} experiences during {temporal.type.replace('_', ' ')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* 2. GEOGRAPHIC PATTERN - Location Cluster */}
      {hasGeographic && patterns.geographic!.map((geo, idx) => (
        <TooltipProvider key={`geo-${idx}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onClick?.('geographic')}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full
                  bg-gradient-to-r from-emerald-500/20 to-teal-500/20
                  border border-emerald-500/30
                  text-emerald-200 hover:text-emerald-100
                  transition-all cursor-pointer
                  ${compact ? 'text-xs' : 'text-sm'}
                `}
              >
                <MapPin className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                {!compact && <span className="font-medium">{geo.count}</span>}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass-card border-glass-border">
              <p className="font-semibold text-emerald-300">
                <MapPin className="inline h-3 w-3 mr-1" />
                Location Cluster
              </p>
              <p className="text-xs text-text-tertiary">
                {geo.count} experiences within {Math.round(geo.radius_km)}km radius
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* 3. TAG NETWORK PATTERN */}
      {hasTagNetwork && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onClick?.('tag_network')}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full
                  bg-gradient-to-r from-amber-500/20 to-orange-500/20
                  border border-amber-500/30
                  text-amber-200 hover:text-amber-100
                  transition-all cursor-pointer
                  ${compact ? 'text-xs' : 'text-sm'}
                `}
              >
                <Link2 className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                {!compact && (
                  <span className="font-medium">{patterns.tag_network!.length}</span>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass-card border-glass-border">
              <p className="font-semibold text-amber-300">
                <Link2 className="inline h-3 w-3 mr-1" />
                Tag Network
              </p>
              <p className="text-xs text-text-tertiary">
                Connected through {patterns.tag_network!.length} tag relationship
                {patterns.tag_network!.length > 1 ? 's' : ''}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* 4. CROSS-CATEGORY PATTERN */}
      {hasCrossCategory && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onClick?.('cross_category')}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full
                  bg-gradient-to-r from-rose-500/20 to-pink-500/20
                  border border-rose-500/30
                  text-rose-200 hover:text-rose-100
                  transition-all cursor-pointer
                  ${compact ? 'text-xs' : 'text-sm'}
                `}
              >
                <GitBranch className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                {!compact && (
                  <span className="font-medium">{patterns.cross_category!.length}</span>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass-card border-glass-border">
              <p className="font-semibold text-rose-300">
                <GitBranch className="inline h-3 w-3 mr-1" />
                Category Bridge
              </p>
              <p className="text-xs text-text-tertiary">
                Overlaps with {patterns.cross_category!.length} other categor
                {patterns.cross_category!.length > 1 ? 'ies' : 'y'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* 5. SIMILARITY SCORE */}
      {hasSimilarity && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full
                  bg-gradient-to-r from-observatory-gold/20 to-yellow-500/20
                  border border-observatory-gold/30
                  text-observatory-gold
                  ${compact ? 'text-xs' : 'text-sm'}
                `}
              >
                <Sparkles className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                {!compact && (
                  <span className="font-medium">
                    {Math.round(patterns.similarity! * 100)}%
                  </span>
                )}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass-card border-glass-border">
              <p className="font-semibold text-observatory-gold">
                <Sparkles className="inline h-3 w-3 mr-1" />
                Similarity Match
              </p>
              <p className="text-xs text-text-tertiary">
                {Math.round(patterns.similarity! * 100)}% similar to your query
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

/**
 * Compact Pattern Count Badge
 * Shows total pattern count as a single badge
 */
export function PatternCountBadge({ patterns }: { patterns: PatternData }) {
  if (!patterns) return null

  const totalPatterns =
    (patterns.temporal?.length || 0) +
    (patterns.geographic?.length || 0) +
    (patterns.tag_network?.length || 0) +
    (patterns.cross_category?.length || 0) +
    (patterns.similarity ? 1 : 0)

  if (totalPatterns === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-observatory-gold/20 border border-observatory-gold/30 text-observatory-gold text-xs"
    >
      <TrendingUp className="h-3 w-3" />
      <span className="font-medium">{totalPatterns}</span>
      <span className="text-text-tertiary">pattern{totalPatterns > 1 ? 's' : ''}</span>
    </motion.div>
  )
}
