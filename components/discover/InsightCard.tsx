import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, TrendingUp, MapPin, Clock, Heart, Tags } from 'lucide-react'

/**
 * Pattern Insight Card Component
 * Displays detected patterns with confidence scores and metadata
 * Used by streamUI for pattern detection results
 */

export interface InsightCardProps {
  type: 'temporal' | 'geographic' | 'semantic' | 'emotional' | 'crossCategory'
  pattern: string
  confidence: number
  dataPoints: any[]
  details?: string
  onExplore?: () => void
}

const PATTERN_ICONS = {
  temporal: Clock,
  geographic: MapPin,
  semantic: Tags,
  emotional: Heart,
  crossCategory: TrendingUp,
}

const PATTERN_LABELS = {
  temporal: 'Temporal Pattern',
  geographic: 'Geographic Pattern',
  semantic: 'Semantic Pattern',
  emotional: 'Emotional Pattern',
  crossCategory: 'Cross-Category Pattern',
}

export function InsightCard({
  type,
  pattern,
  confidence,
  dataPoints,
  details,
  onExplore,
}: InsightCardProps) {
  const Icon = PATTERN_ICONS[type]
  const confidenceColor =
    confidence > 0.8 ? 'default' : confidence > 0.6 ? 'secondary' : 'outline'

  const confidenceLabel =
    confidence > 0.8 ? 'High' : confidence > 0.6 ? 'Medium' : 'Low'

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Pattern Detected</CardTitle>
          </div>
          <Badge variant={confidenceColor}>
            {confidenceLabel} ({(confidence * 100).toFixed(0)}%)
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {PATTERN_LABELS[type]}
          </span>
        </div>

        <CardDescription className="text-base font-medium mt-3">
          {pattern}
        </CardDescription>

        {details && (
          <p className="text-sm text-muted-foreground mt-2">{details}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">
            Based on {dataPoints.length} data points
          </span>

          {onExplore && (
            <Button variant="outline" size="sm" onClick={onExplore}>
              Explore Pattern
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}

/**
 * Multiple Insights Grid Layout
 */
export function InsightGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
}
