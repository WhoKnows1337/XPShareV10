'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'

interface LiveAnalysisResult {
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
}

interface UseLiveAnalysisOptions {
  minLength?: number
  debounceMs?: number
  maxCalls?: number
  enabled?: boolean
}

const DEFAULT_OPTIONS: UseLiveAnalysisOptions = {
  minLength: 50,
  debounceMs: 2000,
  maxCalls: 10,
  enabled: true,
}

export function useLiveAnalysis(
  text: string,
  options: UseLiveAnalysisOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const [analysis, setAnalysis] = useState<LiveAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [callCount, setCallCount] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null)
  const previousTextRef = useRef<string>('')

  const performAnalysis = async (textToAnalyze: string) => {
    // Check if we've exceeded max calls
    if (callCount >= opts.maxCalls!) {
      console.log('Max AI calls reached for this session')
      return
    }

    // Don't analyze if text hasn't changed significantly
    const textDiff = Math.abs(textToAnalyze.length - previousTextRef.current.length)
    if (textDiff < 20 && previousTextRef.current.length > 0) {
      return
    }

    previousTextRef.current = textToAnalyze

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/live-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          currentAnalysis: analysis, // Send current analysis for incremental updates
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result: LiveAnalysisResult = await response.json()
      setAnalysis(result)
      setCallCount(prev => prev + 1)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to analyze text')
        console.error('Live analysis error:', err)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Debounced analysis function
  const debouncedAnalyze = useCallback(
    debounce((text: string) => {
      performAnalysis(text)
    }, opts.debounceMs!),
    [callCount, opts.maxCalls]
  )

  useEffect(() => {
    if (!opts.enabled) return

    if (text.length >= opts.minLength!) {
      debouncedAnalyze(text)
    }

    return () => {
      debouncedAnalyze.cancel()
    }
  }, [text, opts.enabled, opts.minLength, debouncedAnalyze])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    analysis,
    isAnalyzing,
    error,
    callCount,
    maxCalls: opts.maxCalls!,
    hasReachedLimit: callCount >= opts.maxCalls!,
  }
}
