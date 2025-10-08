'use client'

import { useState, useEffect } from 'react'

interface PatternMatch {
  id: string
  title: string
  content: string
  category: string
  similarity: number
  location?: {
    name: string
    distance_km?: number
  }
  occurred_at?: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url?: string
  }
}

interface GeographicCluster {
  region: string
  count: number
  center: [number, number]
  radius_km: number
}

interface TemporalCluster {
  period: string
  count: number
  start_date: string
  end_date: string
}

interface ExternalEvent {
  type: 'solar' | 'earthquake' | 'moon' | 'weather'
  title: string
  description: string
  timestamp: string
  relevance: number
  data?: any
}

interface PatternInsights {
  similar: PatternMatch[]
  geographic: GeographicCluster[]
  temporal: TemporalCluster[]
  externalEvents: ExternalEvent[]
  interestedUsers: Array<{
    id: string
    username: string
    matchScore: number
    experienceCount: number
  }>
  suggestedTags: string[]
  correlations: Array<{
    type: string
    description: string
    strength: number
  }>
}

interface UsePatternMatchingOptions {
  enabled?: boolean
  minSimilarity?: number
  maxResults?: number
}

const DEFAULT_OPTIONS: UsePatternMatchingOptions = {
  enabled: true,
  minSimilarity: 0.7,
  maxResults: 20,
}

export function usePatternMatching(
  text: string,
  category: string | null,
  location: { name: string; coordinates?: [number, number] } | null,
  timestamp: string | null,
  options: UsePatternMatchingOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const [insights, setInsights] = useState<PatternInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!opts.enabled || !text || text.length < 200) {
      return
    }

    const fetchPatterns = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/ai/pattern-matching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            category,
            location,
            timestamp,
            minSimilarity: opts.minSimilarity,
            maxResults: opts.maxResults,
          }),
        })

        if (!response.ok) {
          throw new Error('Pattern matching failed')
        }

        const data: PatternInsights = await response.json()
        setInsights(data)
      } catch (err) {
        console.error('Pattern matching error:', err)
        setError('Failed to find patterns')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatterns()
  }, [text, category, location, timestamp, opts.enabled, opts.minSimilarity, opts.maxResults])

  return {
    insights,
    isLoading,
    error,
  }
}
