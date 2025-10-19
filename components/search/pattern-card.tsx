'use client'

/**
 * Search 5.0 - Pattern Card
 *
 * Displays discovered patterns with:
 * - Pattern type badge
 * - Finding text with [#ID] citations
 * - Confidence score
 * - Data visualization preview
 * - Source IDs
 * - Expand/collapse details
 *
 * @see docs/masterdocs/search5.md (Part 2.2 - Pattern Structure)
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  MapPin,
  Calendar,
  Palette,
  Tag,
  ChevronDown,
  ExternalLink,
  BarChart3,
  Clock as ClockIcon,
  Info
} from 'lucide-react'
import { Pattern, Source } from '@/types/search5'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface PatternCardProps {
  /**
   * Pattern data
   */
  pattern: Pattern

  /**
   * All sources (for citation mapping)
   */
  sources: Source[]

  /**
   * Start expanded
   */
  defaultExpanded?: boolean

  /**
   * Callback when user clicks citation
   */
  onCitationClick?: (sourceId: string) => void

  /**
   * Additional className
   */
  className?: string
}

// ============================================================================
// PATTERN TYPE METADATA
// ============================================================================

const PATTERN_TYPE_CONFIG = {
  color: {
    icon: Palette,
    label: 'Farb-Pattern',
    description: 'Wiederkehrende Farbmuster in Berichten',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30'
  },
  temporal: {
    icon: ClockIcon,
    label: 'Zeit-Pattern',
    description: 'Zeitliche Muster (Monate, Jahreszeiten, Tageszeiten)',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30'
  },
  behavior: {
    icon: TrendingUp,
    label: 'Verhaltens-Pattern',
    description: 'Gemeinsame Verhaltensweisen oder Phänomene',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30'
  },
  location: {
    icon: MapPin,
    label: 'Orts-Pattern',
    description: 'Geografische Cluster und Standorte',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30'
  },
  attribute: {
    icon: Tag,
    label: 'Attribut-Pattern',
    description: 'Korrelationen zwischen Tags und Kategorien',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30'
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PatternCard({
  pattern,
  sources,
  defaultExpanded = false,
  onCitationClick,
  className
}: PatternCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const config = PATTERN_TYPE_CONFIG[pattern.type]
  const Icon = config.icon

  // Map sourceIds to actual Source objects
  const patternSources = pattern.sourceIds
    .map(id => sources.find(s => s.id === id))
    .filter((s): s is Source => s !== undefined)

  // ============================================================================
  // CITATION PARSING
  // ============================================================================

  /**
   * Parse finding text and convert [#ID] citations to clickable links
   */
  const renderFindingWithCitations = () => {
    const citationRegex = /\[#(\d+)\]/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = citationRegex.exec(pattern.finding)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(pattern.finding.substring(lastIndex, match.index))
      }

      // Add citation as clickable badge
      const citationId = parseInt(match[1])
      const citationIndex = pattern.citationIds?.indexOf(citationId) ?? -1

      if (citationIndex !== -1 && patternSources[citationIndex]) {
        const source = patternSources[citationIndex]
        parts.push(
          <TooltipProvider key={`citation-${citationId}-${match.index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCitationClick?.(source.id)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors cursor-pointer"
                >
                  #{citationId}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px]">
                <p className="text-xs font-semibold mb-1">{source.title}</p>
                <p className="text-xs text-muted-foreground">
                  {source.excerpt?.substring(0, 150)}...
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      } else {
        // Fallback if citation not found
        parts.push(
          <span key={`citation-${citationId}-${match.index}`} className="text-xs font-mono text-muted-foreground">
            [#{citationId}]
          </span>
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < pattern.finding.length) {
      parts.push(pattern.finding.substring(lastIndex))
    }

    return parts.length > 0 ? parts : pattern.finding
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)}>
        {/* Header */}
        <CardHeader className={cn('pb-3', config.bg, config.border, 'border-l-4')}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Pattern Type Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('gap-1', config.color)}>
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>

              {/* Confidence Score */}
              {pattern.confidence !== undefined && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={
                          pattern.confidence >= 80 ? 'default' :
                          pattern.confidence >= 60 ? 'secondary' :
                          'outline'
                        }
                        className="gap-1 font-mono"
                      >
                        <Info className="h-3 w-3" />
                        {pattern.confidence}%
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Pattern Konfidenz: {pattern.confidence}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Title */}
            <CardTitle className="text-lg leading-tight">
              {pattern.title}
            </CardTitle>

            {/* Finding (with citations) */}
            <CardDescription className="text-sm leading-relaxed">
              {renderFindingWithCitations()}
            </CardDescription>
          </div>

          {/* Expand Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </Button>
          </motion.div>
        </div>

        {/* Confidence Progress */}
        {pattern.confidence !== undefined && (
          <Progress
            value={pattern.confidence}
            className="mt-3 h-1.5 bg-muted"
          />
        )}
      </CardHeader>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CardContent className="pt-4 space-y-4">
          {/* Data Visualization Preview */}
          {pattern.data && (
            <div className="space-y-3">
              {/* Distribution Chart */}
              {pattern.data.distribution && pattern.data.distribution.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Verteilung
                  </h4>
                  <div className="space-y-2">
                    {pattern.data.distribution.slice(0, 5).map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-mono font-medium">
                            {item.count} ({item.percentage?.toFixed(1) || 0}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn('h-full', config.bg.replace('/10', ''))}
                            style={{ width: `${item.percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Preview */}
              {pattern.data.timeline && pattern.data.timeline.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Zeitverlauf
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {pattern.data.timeline.slice(0, 12).map((item, i) => (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'h-12 rounded flex items-end justify-center p-1 transition-all cursor-help',
                                item.highlight
                                  ? cn(config.bg.replace('/10', '/30'), 'border-2', config.border)
                                  : 'bg-muted hover:bg-muted/70'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-full rounded-t',
                                  item.highlight ? config.bg.replace('/10', '') : 'bg-muted-foreground/30'
                                )}
                                style={{
                                  height: `${Math.max((item.count / Math.max(...pattern.data.timeline!.map(t => t.count))) * 100, 10)}%`
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-medium">{item.month}</p>
                            <p className="text-xs text-muted-foreground">{item.count} Berichte</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographic Cluster */}
              {pattern.data.geoCluster && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Geografisches Cluster
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Zentrum:</span>{' '}
                      <span className="font-medium">{pattern.data.geoCluster.center}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Radius:</span>{' '}
                      <span className="font-medium">{pattern.data.geoCluster.radius} km</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Berichte:</span>{' '}
                      <span className="font-medium">{pattern.data.geoCluster.count}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Source References */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Quellen ({patternSources.length})
            </h4>
            <div className="grid gap-2">
              {patternSources.slice(0, 5).map((source, i) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <Link
                    href={`/experiences/${source.id}`}
                    className="group flex items-start gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                  >
                  <Badge variant="outline" className="font-mono flex-shrink-0">
                    #{i + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {source.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {source.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {source.category}
                      </Badge>
                      {source.date_occurred && (
                        <span>{new Date(source.date_occurred).toLocaleDateString('de-DE')}</span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}

              {patternSources.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{patternSources.length - 5} weitere Quellen
                </p>
              )}
            </div>
          </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      </Card>
    </motion.div>
  )
}
