'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sparkles,
  TrendingUp,
  Sun,
  Moon,
  Cloud,
  Zap,
  Network,
  BarChart3,
  Calendar,
  MapPin,
  Info,
  CloudRain,
} from 'lucide-react'
import { formatExternalEvent } from '@/lib/api/external-events'
import type { ExternalEvent } from '@/lib/api/external-events'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation'
import { ScientificDetailsDialog } from './ScientificDetailsDialog'


interface PatternMatch {
  category: string
  count: number
  strength: number
  timeframe: string
}

interface PatternSidebarProps {
  experienceId: string
  category: string
  dateOccurred?: string
  locationLat?: number
  locationLng?: number
  locationText?: string
  patternMatches?: PatternMatch[]
  externalEvents?: ExternalEvent[]
  similarCount?: number
}

export function PatternSidebar({
  experienceId,
  category,
  dateOccurred,
  locationLat,
  locationLng,
  locationText,
  patternMatches = [],
  externalEvents = [],
  similarCount = 0,
}: PatternSidebarProps) {
  // Calculate total pattern strength
  const totalPatternStrength = patternMatches.reduce(
    (sum, pattern) => sum + pattern.strength,
    0
  )
  const avgPatternStrength =
    patternMatches.length > 0 ? totalPatternStrength / patternMatches.length : 0

  const hasPatterns = patternMatches.length > 0 || externalEvents.length > 0

  // Scroll-triggered animation
  const { y, opacity } = useScrollAnimation()

  return (
    <motion.div
      className="space-y-6"
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Pattern Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Pattern Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPatterns ? (
            <>
              {/* Pattern Strength Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pattern Strength</span>
                  <Badge
                    variant={
                      avgPatternStrength > 70
                        ? 'default'
                        : avgPatternStrength > 40
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {avgPatternStrength > 70
                      ? 'Strong'
                      : avgPatternStrength > 40
                      ? 'Moderate'
                      : 'Weak'}
                  </Badge>
                </div>
                <Progress value={avgPatternStrength} className="h-2" />
              </div>

              {/* Similar Experiences Count */}
              {similarCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Similar Experiences</span>
                  </div>
                  <Badge variant="secondary">{similarCount}</Badge>
                </div>
              )}

              {/* Pattern Matches */}
              {patternMatches.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Pattern Clusters
                    </p>
                    {patternMatches.map((pattern, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{pattern.category}</span>
                          <Badge variant="outline" className="text-xs">
                            {pattern.count}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={pattern.strength} className="h-1 flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {pattern.strength}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {pattern.timeframe}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No patterns detected yet</p>
              <p className="text-xs mt-1">
                Patterns emerge as more similar experiences are shared
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Events Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            External Events
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Environmental and cosmic events that occurred around the same time
                    and location as this experience
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {externalEvents.length > 0 ? (
            externalEvents.map((event, idx) => {
              const eventFormat = formatExternalEvent(event)
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${eventFormat.borderColor} ${eventFormat.bgColor} transition-colors`}
                >
                  <div className="text-2xl mt-0.5">{eventFormat.icon}</div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium ${eventFormat.color}`}>{event.name}</p>
                    {event.type === 'solar' && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          KP Index: {event.kp_index} · {new Date(event.timestamp).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <Progress value={event.intensity} className="h-1.5 mt-2" />
                      </>
                    )}
                    {event.type === 'moon' && (
                      <p className="text-xs text-muted-foreground">
                        {event.illumination}% beleuchtet · {event.phase}
                      </p>
                    )}
                    {event.type === 'weather' && (
                      <p className="text-xs text-muted-foreground">
                        {event.temperature}°C · {event.clouds}% Wolken · {event.wind_speed} km/h Wind
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {dateOccurred && locationLat && locationLng ? (
                <>
                  <Cloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Loading external events...</p>
                  <p className="text-xs mt-1">
                    Analyzing solar, lunar, and weather data
                  </p>
                </>
              ) : (
                <>
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Location data needed</p>
                  <p className="text-xs mt-1">
                    Add date and location to see external events
                  </p>
                </>
              )}
            </div>
          )}

          {externalEvents.length > 0 && (
            <ScientificDetailsDialog
              externalEvents={externalEvents}
              dateOccurred={dateOccurred}
              locationText={locationText}
            />
          )}
        </CardContent>
      </Card>

      {/* Pattern Graph Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-500" />
            Pattern Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasPatterns ? (
            <div className="space-y-3">
              <div className="aspect-square bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20">
                <div className="text-center">
                  <Network className="w-12 h-12 mx-auto mb-2 text-primary/40" />
                  <p className="text-xs text-muted-foreground">
                    Graph visualization
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {similarCount} connected nodes
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Network className="w-4 h-4 mr-2" />
                Explore full graph
              </Button>
            </div>
          ) : (
            <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Network className="w-12 h-12 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  No connections yet
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          {dateOccurred && (
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <a href={`/timeline?date=${dateOccurred}&category=${category}`}>
                <Calendar className="w-4 h-4 mr-2" />
                View on timeline
              </a>
            </Button>
          )}
          {locationLat && locationLng && (
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <a href={`/map?lat=${locationLat}&lng=${locationLng}&category=${category}`}>
                <MapPin className="w-4 h-4 mr-2" />
                View on map
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href={`/browse?category=${category}&sort=similarity`}>
              <Sparkles className="w-4 h-4 mr-2" />
              Find more patterns
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
