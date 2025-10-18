'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Moon,
  MapPin,
  Link2,
  GitBranch,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Pattern Summary Data from API
 * (From get_pattern_summary RPC response)
 */
interface PatternSummary {
  summary?: {
    total_patterns_found: number
    dominant_pattern_type?: string
    insights?: string[]
  }
  patterns?: {
    temporal?: {
      count: number
      patterns: Array<{
        pattern_id: string
        phase: string
        emoji: string
        pattern_count: number
        metadata: {
          phase: string
          emoji: string
        }
        experiences: string[]
      }>
    }
    geographic?: {
      count: number
      patterns: Array<{
        cluster_id: number
        pattern_count: number
        metadata: {
          center_lat: number
          center_lng: number
          radius_km: number
        }
        experiences: string[]
      }>
    }
    tag_network?: {
      count: number
      patterns: Array<{
        tag1: string
        tag2: string
        cooccurrence_count: number
        metadata: {
          strength: number
        }
        experiences: string[]
      }>
    }
    cross_category?: {
      count: number
      patterns: Array<{
        category1: string
        category2: string
        overlap_count: number
        metadata: {
          pattern_type: string
        }
        experiences: string[]
      }>
    }
  }
}

interface PatternInsightsPanelProps {
  patternSummary: PatternSummary | null
  resultCount: number
  onPatternClick?: (patternType: string, patternId?: string) => void
}

/**
 * PatternInsightsPanel Component
 *
 * Comprehensive visualization of all detected patterns in search results.
 * Shows temporal, geographic, tag network, and cross-category patterns.
 *
 * Usage:
 * ```tsx
 * <PatternInsightsPanel
 *   patternSummary={metadata.patterns}
 *   resultCount={results.length}
 *   onPatternClick={(type, id) => console.log('Pattern clicked:', type, id)}
 * />
 * ```
 */
export function PatternInsightsPanel({
  patternSummary,
  resultCount,
  onPatternClick,
}: PatternInsightsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    temporal: true,
    geographic: false,
    tag_network: false,
    cross_category: false,
  })

  if (!patternSummary || !patternSummary.summary) {
    return null
  }

  const totalPatterns = patternSummary.summary.total_patterns_found || 0

  if (totalPatterns === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Pattern Discovery
          </CardTitle>
          <CardDescription className="text-xs">
            No patterns detected in this result set
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <Card className="border-primary/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-observatory-gold" />
            Pattern Insights
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalPatterns} patterns
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Discovered across {resultCount} experiences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Key Insights */}
        {patternSummary.summary.insights && patternSummary.summary.insights.length > 0 && (
          <div className="p-3 rounded-lg bg-observatory-gold/10 border border-observatory-gold/30">
            <p className="text-xs font-semibold text-observatory-gold mb-1.5">
              Key Insights
            </p>
            <ul className="space-y-1">
              {patternSummary.summary.insights.map((insight, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <TrendingUp className="h-3 w-3 text-observatory-gold shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TEMPORAL PATTERNS */}
        {patternSummary.patterns?.temporal && patternSummary.patterns.temporal.count > 0 && (
          <PatternSection
            icon={<Moon className="h-3.5 w-3.5" />}
            title="Temporal Echoes"
            count={patternSummary.patterns.temporal.count}
            color="purple"
            expanded={expandedSections.temporal}
            onToggle={() => toggleSection('temporal')}
          >
            <div className="space-y-2">
              {patternSummary.patterns.temporal.patterns.map((pattern, idx) => (
                <button
                  key={idx}
                  onClick={() => onPatternClick?.('temporal', pattern.pattern_id)}
                  className="w-full p-2 rounded-md hover:bg-purple-500/10 transition-colors text-left border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <span className="text-base">{pattern.emoji}</span>
                      {pattern.phase.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs border-purple-500/30">
                      {pattern.pattern_count} exp.
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cluster of experiences during this lunar phase
                  </p>
                </button>
              ))}
            </div>
          </PatternSection>
        )}

        {/* GEOGRAPHIC PATTERNS */}
        {patternSummary.patterns?.geographic && patternSummary.patterns.geographic.count > 0 && (
          <PatternSection
            icon={<MapPin className="h-3.5 w-3.5" />}
            title="Location Clusters"
            count={patternSummary.patterns.geographic.count}
            color="emerald"
            expanded={expandedSections.geographic}
            onToggle={() => toggleSection('geographic')}
          >
            <div className="space-y-2">
              {patternSummary.patterns.geographic.patterns.map((pattern, idx) => (
                <button
                  key={idx}
                  onClick={() => onPatternClick?.('geographic', pattern.cluster_id.toString())}
                  className="w-full p-2 rounded-md hover:bg-emerald-500/10 transition-colors text-left border border-emerald-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <Globe className="h-3 w-3" />
                      Cluster #{pattern.cluster_id}
                    </span>
                    <Badge variant="outline" className="text-xs border-emerald-500/30">
                      {pattern.pattern_count} exp.
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(pattern.metadata.radius_km)}km radius around{' '}
                    {pattern.metadata.center_lat.toFixed(2)}°, {pattern.metadata.center_lng.toFixed(2)}°
                  </p>
                </button>
              ))}
            </div>
          </PatternSection>
        )}

        {/* TAG NETWORK PATTERNS */}
        {patternSummary.patterns?.tag_network && patternSummary.patterns.tag_network.count > 0 && (
          <PatternSection
            icon={<Link2 className="h-3.5 w-3.5" />}
            title="Tag Relationships"
            count={patternSummary.patterns.tag_network.count}
            color="amber"
            expanded={expandedSections.tag_network}
            onToggle={() => toggleSection('tag_network')}
          >
            <div className="space-y-2">
              {patternSummary.patterns.tag_network.patterns.slice(0, 5).map((pattern, idx) => (
                <button
                  key={idx}
                  onClick={() => onPatternClick?.('tag_network', `${pattern.tag1}-${pattern.tag2}`)}
                  className="w-full p-2 rounded-md hover:bg-amber-500/10 transition-colors text-left border border-amber-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      #{pattern.tag1} ↔ #{pattern.tag2}
                    </span>
                    <Badge variant="outline" className="text-xs border-amber-500/30">
                      {pattern.cooccurrence_count}×
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: {Math.round(pattern.metadata.strength * 100)}%
                  </p>
                </button>
              ))}
            </div>
          </PatternSection>
        )}

        {/* CROSS-CATEGORY PATTERNS */}
        {patternSummary.patterns?.cross_category && patternSummary.patterns.cross_category.count > 0 && (
          <PatternSection
            icon={<GitBranch className="h-3.5 w-3.5" />}
            title="Category Bridges"
            count={patternSummary.patterns.cross_category.count}
            color="rose"
            expanded={expandedSections.cross_category}
            onToggle={() => toggleSection('cross_category')}
          >
            <div className="space-y-2">
              {patternSummary.patterns.cross_category.patterns.map((pattern, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    onPatternClick?.('cross_category', `${pattern.category1}-${pattern.category2}`)
                  }
                  className="w-full p-2 rounded-md hover:bg-rose-500/10 transition-colors text-left border border-rose-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">
                      {pattern.category1} ↔ {pattern.category2}
                    </span>
                    <Badge variant="outline" className="text-xs border-rose-500/30">
                      {pattern.overlap_count} exp.
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {pattern.metadata.pattern_type} overlap
                  </p>
                </button>
              ))}
            </div>
          </PatternSection>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Collapsible Pattern Section
 */
function PatternSection({
  icon,
  title,
  count,
  color,
  expanded,
  onToggle,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  color: 'purple' | 'emerald' | 'amber' | 'rose'
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const colorClasses = {
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    rose: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
  }

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          'w-full justify-between hover:bg-accent/50 border',
          colorClasses[color]
        )}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {title}
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </Button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
