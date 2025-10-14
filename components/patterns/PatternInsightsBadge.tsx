'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, MapPin, Calendar, Users, Sparkles } from 'lucide-react'

interface PatternInsightsBadgeProps {
  experienceId: string
  className?: string
  onClick?: () => void
}

export function PatternInsightsBadge({
  experienceId,
  className = '',
  onClick,
}: PatternInsightsBadgeProps) {
  const [insightCount, setInsightCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsightCount()
  }, [experienceId])

  const fetchInsightCount = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patterns/analyze?experienceId=${experienceId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }

      const data = await response.json()
      setInsightCount(data.insights?.length || 0)
    } catch (err) {
      console.error('Error fetching pattern insights count:', err)
      setInsightCount(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading || insightCount === 0) {
    return null
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium transition-all ${className}`}
    >
      <Sparkles className="w-4 h-4" />
      <span>{insightCount} {insightCount === 1 ? 'Muster' : 'Muster'}</span>
    </button>
  )
}
