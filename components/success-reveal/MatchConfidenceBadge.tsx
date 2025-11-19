'use client'

import { Shield, AlertTriangle, HelpCircle } from 'lucide-react'

interface MatchConfidenceBadgeProps {
  score: number // 0-1
  showLabel?: boolean
}

export function MatchConfidenceBadge({ score, showLabel = true }: MatchConfidenceBadgeProps) {
  const percentage = Math.round(score * 100)

  // Determine confidence level
  const getConfidenceLevel = () => {
    if (percentage >= 90) return { label: 'Very High', color: 'emerald', icon: Shield }
    if (percentage >= 75) return { label: 'High', color: 'blue', icon: Shield }
    if (percentage >= 60) return { label: 'Medium', color: 'amber', icon: AlertTriangle }
    return { label: 'Low', color: 'gray', icon: HelpCircle }
  }

  const confidence = getConfidenceLevel()
  const Icon = confidence.icon

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
        ${
          confidence.color === 'emerald'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : confidence.color === 'blue'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : confidence.color === 'amber'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }
      `}
    >
      <Icon className="h-3 w-3" />
      <span>{percentage}%</span>
      {showLabel && <span className="hidden sm:inline">Match</span>}
    </div>
  )
}
