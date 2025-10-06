'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, TrendingUp } from 'lucide-react'

interface Insight {
  type: 'warning' | 'success' | 'info'
  severity: 'high' | 'medium' | 'low'
  questionId: string
  questionText: string
  message: string
  suggestion: string
  metric?: {
    name: string
    value: number
    threshold: number
  }
}

interface InsightsStats {
  totalQuestions: number
  criticalIssues: number
  warnings: number
  successes: number
  avgAnswerRate: string
  avgResponseTime: string
}

interface AnalyticsInsightsProps {
  categoryId?: string
}

export function AnalyticsInsights({ categoryId }: AnalyticsInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [stats, setStats] = useState<InsightsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [categoryId])

  const fetchInsights = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryId) {
        params.set('category_id', categoryId)
      }

      const res = await fetch(`/api/admin/analytics/insights?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch insights')

      const data = await res.json()
      setInsights(data.insights || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Insights error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (insight: Insight) => {
    if (insight.type === 'warning') {
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    }
    if (insight.type === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    return <Info className="h-5 w-5 text-blue-500" />
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'destructive'
    if (severity === 'medium') return 'default'
    return 'secondary'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading insights...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-2xl font-bold">{stats.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
              <p className="text-2xl font-bold text-red-500">{stats.criticalIssues}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Answer Rate</p>
              <p className="text-2xl font-bold">{stats.avgAnswerRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-2xl font-bold">{stats.avgResponseTime}s</p>
            </div>
          </div>
        )}

        {/* Insights List */}
        {insights.length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>All Good!</AlertTitle>
            <AlertDescription>
              No critical issues found. Your questions are performing well.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {insights.slice(0, 10).map((insight, idx) => (
              <Alert key={idx} className="relative">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getIcon(insight)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <AlertTitle className="text-sm font-semibold">
                          {insight.message}
                        </AlertTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          "{insight.questionText}"
                        </p>
                      </div>
                      <Badge variant={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      <span className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{insight.suggestion}</span>
                      </span>
                    </AlertDescription>
                    {insight.metric && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        {insight.metric.name}: {insight.metric.value.toFixed(1)} (threshold: {insight.metric.threshold})
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {insights.length > 10 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            Showing top 10 insights of {insights.length} total
          </p>
        )}
      </CardContent>
    </Card>
  )
}
