'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, Sparkles, Eye, MessageCircle, ThumbsUp } from 'lucide-react'
import { SimilarUserCard } from '@/components/feed/similar-user-card'
import { PatternPredictionCard } from '@/components/feed/pattern-prediction-card'

interface TrendingExperience {
  id: string
  title: string
  category: string
  upvote_count: number
  comment_count: number
  view_count: number
}

interface FeedRightPanelProps {
  trendingExperiences?: TrendingExperience[]
}

export function FeedRightPanel({ trendingExperiences = [] }: FeedRightPanelProps) {
  // Mock data if empty
  const trending = trendingExperiences.length > 0 ? trendingExperiences : [
    {
      id: '1',
      title: 'UFO Wave over Lake Constance',
      category: 'UFO',
      upvote_count: 234,
      comment_count: 45,
      view_count: 1200,
    },
    {
      id: '2',
      title: 'Solar Storm Correlation',
      category: 'Pattern',
      upvote_count: 156,
      comment_count: 34,
      view_count: 890,
    },
    {
      id: '3',
      title: 'Synchronicity Cluster',
      category: 'Synchronicity',
      upvote_count: 123,
      comment_count: 28,
      view_count: 670,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Similar User Card - Aha-Moment #6 */}
      <SimilarUserCard />

      {/* Pattern Prediction Card - Aha-Moment #7 */}
      <PatternPredictionCard category="UFO" />

      {/* Trending Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Trending
          </CardTitle>
          <CardDescription className="text-xs">Most popular experiences today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trending.slice(0, 3).map((exp, index) => (
            <Link
              key={exp.id}
              href={`/experiences/${exp.id}`}
              className="block group hover:bg-accent rounded-lg p-3 -mx-3 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {exp.title}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {exp.category}
                  </Badge>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {exp.upvote_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {exp.comment_count}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/feed?sort=popular">View All Trending</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Patterns Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Patterns
          </CardTitle>
          <CardDescription className="text-xs">Recent activity trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mini Chart Placeholder */}
          <div className="h-24 bg-gradient-to-t from-primary/20 to-primary/5 rounded-lg flex items-end justify-around p-2">
            {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
              <div
                key={i}
                className="bg-primary rounded-sm w-3"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Peak Activity:</span>
              <span className="font-semibold">15. March 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trend:</span>
              <Badge variant="default" className="text-xs">
                ↗ +23% this week
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/patterns">Explore Patterns</Link>
          </Button>
        </CardContent>
      </Card>

      {/* AI Insights Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">
            15 experiences in <strong>Lake Constance</strong> region correlate with{' '}
            <strong>solar storm activity</strong> in the past 7 days.
          </p>
          <div className="p-2 bg-background rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Prediction:</p>
            <p className="text-sm font-semibold">
              Solar Maximum: March 24-28
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              78% probability for increased sightings
            </p>
          </div>
          <Button variant="default" size="sm" className="w-full">
            Enable Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
