'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'

interface PatternInsight {
  id: string
  experience_id: string
  insight_type: 'attribute_correlation' | 'geographic_cluster' | 'temporal_pattern' | 'similar_users'
  title: string
  description: string
  confidence: number
  related_experiences: string[]
  metadata: Record<string, any>
  created_at: string
}

interface PatternInsightsCardProps {
  experienceId: string
  className?: string
}

export function PatternInsightsCard({ experienceId, className = '' }: PatternInsightsCardProps) {
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchInsights()
  }, [experienceId])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patterns/analyze?experienceId=${experienceId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }

      const data = await response.json()
      setInsights(data.insights || [])
    } catch (err: any) {
      console.error('Error fetching pattern insights:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleInsight = (insightId: string) => {
    setExpandedInsights((prev) => {
      const next = new Set(prev)
      if (next.has(insightId)) {
        next.delete(insightId)
      } else {
        next.add(insightId)
      }
      return next
    })
  }

  const getInsightIcon = (type: PatternInsight['insight_type']) => {
    switch (type) {
      case 'attribute_correlation':
        return <TrendingUp className="w-5 h-5" />
      case 'geographic_cluster':
        return <MapPin className="w-5 h-5" />
      case 'temporal_pattern':
        return <Calendar className="w-5 h-5" />
      case 'similar_users':
        return <Users className="w-5 h-5" />
      default:
        return <Sparkles className="w-5 h-5" />
    }
  }

  const getInsightColor = (type: PatternInsight['insight_type']) => {
    switch (type) {
      case 'attribute_correlation':
        return 'from-purple-500 to-pink-500'
      case 'geographic_cluster':
        return 'from-blue-500 to-cyan-500'
      case 'temporal_pattern':
        return 'from-orange-500 to-red-500'
      case 'similar_users':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100)
    let color = 'bg-green-500/20 text-green-400'

    if (confidence < 0.6) {
      color = 'bg-orange-500/20 text-orange-400'
    } else if (confidence < 0.8) {
      color = 'bg-yellow-500/20 text-yellow-400'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
        {percentage}% Konfidenz
      </span>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="ml-3 text-white/60">Analysiere Muster...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 ${className}`}>
        <p className="text-red-400">Fehler beim Laden der Insights: {error}</p>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">Noch keine Muster erkannt</p>
          <p className="text-white/40 text-sm mt-1">
            Insights werden automatisch nach der Veröffentlichung generiert
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Pattern Insights</h3>
          <p className="text-white/60 text-sm">{insights.length} Muster erkannt</p>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => {
          const isExpanded = expandedInsights.has(insight.id)

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Insight Header */}
              <button
                onClick={() => toggleInsight(insight.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-r ${getInsightColor(insight.insight_type)} bg-opacity-20 rounded-lg text-white`}>
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold">{insight.title}</h4>
                    {getConfidenceBadge(insight.confidence)}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white/60" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/60" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-4 space-y-3">
                      <p className="text-white/80 text-sm">{insight.description}</p>

                      {/* Related Experiences */}
                      {insight.related_experiences && insight.related_experiences.length > 0 && (
                        <div className="mt-3">
                          <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                            Ähnliche Experiences ({insight.related_experiences.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {insight.related_experiences.slice(0, 5).map((relatedId, idx) => (
                              <a
                                key={idx}
                                href={`/experiences/${relatedId}`}
                                className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors"
                              >
                                Experience #{idx + 1}
                              </a>
                            ))}
                            {insight.related_experiences.length > 5 && (
                              <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                                +{insight.related_experiences.length - 5} mehr
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Details</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(insight.metadata).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="text-white/40">{key}:</span>
                                <span className="text-white/80 ml-1">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
