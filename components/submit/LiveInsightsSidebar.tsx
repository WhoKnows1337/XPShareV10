'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  MapPin,
  Clock,
  Tag,
  Heart,
  TrendingUp,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LiveInsightsSidebarProps {
  analysis: {
    category: string | null
    location: {
      name: string | null
      confidence: number
    } | null
    time: {
      date: string | null
      timeOfDay: string | null
      isApproximate: boolean
    } | null
    emotion: string | null
    tags: string[]
    similarCount: number
    externalEvents: Array<{
      type: string
      title: string
      timestamp: string
      relevance: number
    }>
  } | null
  isAnalyzing: boolean
  callCount: number
  maxCalls: number
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  ufo: { label: 'UFO Sighting', emoji: '🛸' },
  paranormal: { label: 'Paranormal', emoji: '👻' },
  dreams: { label: 'Dream Experience', emoji: '💭' },
  psychedelic: { label: 'Psychedelic', emoji: '🌈' },
  spiritual: { label: 'Spiritual', emoji: '✨' },
  synchronicity: { label: 'Synchronicity', emoji: '🔮' },
  nde: { label: 'Near-Death Experience', emoji: '💫' },
  other: { label: 'Other Experience', emoji: '🌟' },
}

export function LiveInsightsSidebar({
  analysis,
  isAnalyzing,
  callCount,
  maxCalls,
}: LiveInsightsSidebarProps) {
  const categoryInfo = analysis?.category
    ? categoryLabels[analysis.category]
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Live Insights
        </h2>
        <div className="text-xs text-muted-foreground">
          {callCount}/{maxCalls} AI calls
        </div>
      </div>

      {/* Analyzing Indicator */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-purple-600"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category */}
      {categoryInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Detected Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {categoryInfo.emoji} {categoryInfo.label}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Similar Reports */}
      {analysis && analysis.similarCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Similar Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.similarCount}
                </div>
                <p className="text-sm text-muted-foreground">
                  experiences with similar content found
                </p>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Similar →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Location */}
      {analysis?.location?.name && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Detected Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{analysis.location.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(analysis.location.confidence * 100)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Time */}
      {analysis?.time?.date && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Detected Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {new Date(analysis.time.date).toLocaleDateString()}
              </p>
              {analysis.time.timeOfDay && (
                <p className="text-xs text-muted-foreground capitalize">
                  {analysis.time.timeOfDay}
                </p>
              )}
              {analysis.time.isApproximate && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Approximate
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* External Events */}
      {analysis && analysis.externalEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sun className="h-4 w-4" />
                External Events
              </CardTitle>
              <CardDescription className="text-xs">
                Detected around the same time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.externalEvents.map((event, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-start gap-2">
                      {event.type === 'solar' && <Sun className="h-4 w-4 text-orange-500 mt-0.5" />}
                      {event.type === 'moon' && <Moon className="h-4 w-4 text-blue-500 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tags */}
      {analysis && analysis.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Suggested Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Emotion */}
      {analysis?.emotion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Detected Emotion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="capitalize">
                {analysis.emotion}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!analysis && !isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Start typing to see AI insights...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
