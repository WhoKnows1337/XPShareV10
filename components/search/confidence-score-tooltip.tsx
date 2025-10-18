'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { InfoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfidenceScoreTooltipProps {
  confidence: number
  className?: string
}

function getConfidenceLevel(confidence: number) {
  if (confidence >= 80) {
    return {
      label: 'Exzellent',
      description: 'Sehr hohe Übereinstimmung zwischen deiner Frage und den gefundenen Quellen.',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
    }
  } else if (confidence >= 60) {
    return {
      label: 'Gut',
      description: 'Hohe Relevanz. Die Quellen passen gut zu deiner Frage.',
      color: 'text-lime-600 dark:text-lime-400',
      bgColor: 'bg-lime-50 dark:bg-lime-950/30',
      borderColor: 'border-lime-200 dark:border-lime-800',
    }
  } else if (confidence >= 40) {
    return {
      label: 'Mittel',
      description: 'Moderate Relevanz. Die Antwort basiert auf teilweise passenden Quellen.',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
    }
  } else {
    return {
      label: 'Niedrig',
      description: 'Wenig relevante Quellen gefunden. Die Antwort könnte ungenau sein.',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
    }
  }
}

export function ConfidenceScoreTooltip({ confidence, className }: ConfidenceScoreTooltipProps) {
  const level = getConfidenceLevel(confidence)

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-1.5 cursor-help transition-colors hover:opacity-80',
            className
          )}
        >
          <div className={cn('text-lg font-bold', level.color)}>{confidence}%</div>
          <InfoIcon className={cn('w-4 h-4', level.color)} />
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="end" className="w-80">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <InfoIcon className="w-5 h-5 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Was bedeutet dieser Score?</h4>
          </div>

          {/* Confidence Level Badge */}
          <div
            className={cn(
              'px-3 py-2 rounded-md border',
              level.bgColor,
              level.borderColor
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Konfidenz-Level</span>
              <span className={cn('text-sm font-bold', level.color)}>{level.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{level.description}</p>
          </div>

          {/* Technical Explanation */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-medium">📊 Technische Erklärung:</p>
            <p>
              Der Konfidenz-Score basiert auf der <strong>semantischen Ähnlichkeit</strong> zwischen
              deiner Frage und den gefundenen Erfahrungsberichten. Er zeigt, wie gut die Quellen zu
              deiner Anfrage passen.
            </p>
          </div>

          {/* Score Ranges */}
          <div className="space-y-1.5 text-xs">
            <p className="font-medium text-muted-foreground">Score-Bereiche:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-12 text-green-600 dark:text-green-400 font-medium">80-100%</div>
                <div className="text-muted-foreground">Exzellente Übereinstimmung</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 text-lime-600 dark:text-lime-400 font-medium">60-80%</div>
                <div className="text-muted-foreground">Gute Relevanz</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 text-orange-600 dark:text-orange-400 font-medium">40-60%</div>
                <div className="text-muted-foreground">Moderate Relevanz</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 text-red-600 dark:text-red-400 font-medium">&lt;40%</div>
                <div className="text-muted-foreground">Niedrige Relevanz</div>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tipp:</strong> Höhere Werte bedeuten relevantere Quellen und präzisere
              Antworten.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
