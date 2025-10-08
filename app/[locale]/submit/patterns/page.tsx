'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Sun,
  Moon,
  Zap,
  Tag,
  ExternalLink,
  Map as MapIcon,
} from 'lucide-react'
import { usePatternMatching } from '@/lib/hooks/usePatternMatching'
import { motion, AnimatePresence } from 'framer-motion'
import { MapViewModal } from '@/components/submit/MapViewModal'
import { EnvironmentDataCard } from '@/components/submit/EnvironmentDataCard'

interface DraftData {
  text: string
  title?: string
  analysis?: {
    category: string
    location: { name: string; coordinates?: [number, number] }
    time: { date: string }
  }
  category?: string
  location?: string
  date?: string
}

export default function PatternsPage() {
  const router = useRouter()
  const [data, setData] = useState<DraftData | null>(null)
  const [showMap, setShowMap] = useState(false)

  const { insights, isLoading, error } = usePatternMatching(
    data?.text || '',
    data?.analysis?.category || data?.category || null,
    data?.analysis?.location || (data?.location ? { name: data.location } : null),
    data?.analysis?.time?.date || data?.date || null,
    { enabled: !!data }
  )

  useEffect(() => {
    const draft = localStorage.getItem('experience_draft')
    if (!draft) {
      router.push('/submit')
      return
    }

    try {
      const parsed = JSON.parse(draft)
      setData(parsed)
    } catch (e) {
      console.error('Failed to parse draft:', e)
      router.push('/submit')
    }
  }, [router])

  const handleContinue = () => {
    router.push('/submit/privacy')
  }

  const handleSkip = () => {
    router.push('/submit/privacy')
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🎯 Pattern Discovery</h1>
        <p className="text-muted-foreground">
          We found interesting patterns and connections for your experience
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push('/submit/final')} className="mt-4">
              Continue Anyway →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Environment Data */}
          <EnvironmentDataCard
            timestamp={data?.analysis?.time?.date || data?.date || null}
            coordinates={data?.analysis?.location?.coordinates}
          />

          {/* Similar Experiences */}
          {insights.similar.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  {insights.similar.length} Similar Experiences Found
                </CardTitle>
                <CardDescription>
                  Other users have reported similar experiences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {insights.geographic.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Geographic Clusters
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {insights.temporal.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Time Patterns
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(
                        (insights.similar.reduce((sum, exp) => sum + exp.similarity, 0) /
                          insights.similar.length) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Similarity</div>
                  </div>
                </div>

                {/* Top Similar Experiences */}
                <div className="space-y-3">
                  {insights.similar.slice(0, 3).map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-lg border border-border hover:border-purple-500 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                          <div>
                            <p className="font-medium text-sm">{exp.user.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(exp.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {Math.round(exp.similarity * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm line-clamp-2">{exp.content}</p>
                      {exp.location?.name && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {exp.location.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowMap(true)}>
                    <MapIcon className="h-4 w-4 mr-2" />
                    🗺️ View on Map
                  </Button>
                  <Button variant="outline">
                    View All {insights.similar.length} →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map View Modal */}
          <MapViewModal
            open={showMap}
            onOpenChange={setShowMap}
            experiences={insights.similar}
          />

          {/* External Events */}
          {insights.externalEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  External Events Detected
                </CardTitle>
                <CardDescription>
                  Astronomical and geophysical events around the same time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.externalEvents.map((event, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      {event.type === 'solar' && (
                        <Sun className="h-5 w-5 text-orange-500 mt-0.5" />
                      )}
                      {event.type === 'moon' && (
                        <Moon className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      {event.type === 'earthquake' && (
                        <Zap className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(event.relevance * 100)}% relevant
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Geographic Clusters */}
          {insights.geographic.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Geographic Hotspots
                </CardTitle>
                <CardDescription>
                  Areas with similar experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.geographic.map((cluster, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{cluster.region}</p>
                          <p className="text-xs text-muted-foreground">
                            Within {cluster.radius_km}km radius
                          </p>
                        </div>
                      </div>
                      <Badge>{cluster.count} experiences</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Temporal Clusters */}
          {insights.temporal.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Time Patterns
                </CardTitle>
                <CardDescription>
                  When similar experiences occurred
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.temporal.map((cluster, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{cluster.period}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(cluster.start_date).toLocaleDateString()} -{' '}
                            {new Date(cluster.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge>{cluster.count} experiences</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interested Users */}
          {insights.interestedUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Interested Community Members
                </CardTitle>
                <CardDescription>
                  Users with similar experiences who might want to connect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {insights.interestedUsers.slice(0, 6).map((user) => (
                    <div
                      key={user.id}
                      className="p-3 rounded-lg border border-border hover:border-purple-500 transition-colors cursor-pointer text-center"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-2" />
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.experienceCount} experiences
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {Math.round(user.matchScore * 100)}% match
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Notify These Users
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Suggested Tags */}
          {insights.suggestedTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-pink-500" />
                  Suggested Tags from Patterns
                </CardTitle>
                <CardDescription>
                  Common tags used in similar experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {insights.suggestedTags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer">
                      #{tag}
                      <button className="ml-2 hover:text-green-600">✓</button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Correlations */}
          {insights.correlations.length > 0 && (
            <Card className="border-purple-500/50 bg-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Scientific Insights
                </CardTitle>
                <CardDescription>
                  Interesting correlations discovered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.correlations.map((corr, i) => (
                  <div key={i} className="p-4 rounded-lg bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {corr.type}
                      </Badge>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className={`h-2 w-2 rounded-full ${
                              j < Math.round(corr.strength * 5)
                                ? 'bg-purple-500'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{corr.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
        <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
          Skip Patterns
        </Button>
        <Button onClick={handleContinue} className="flex-1" size="lg">
          Continue to Privacy Settings →
        </Button>
      </div>
    </div>
  )
}
