'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Prediction {
  event_type: string
  date_range: string
  probability: number
}

interface PatternPredictionCardProps {
  category: string
}

export function PatternPredictionCard({ category }: PatternPredictionCardProps) {
  const { data: prediction, isLoading } = useQuery({
    queryKey: ['pattern-prediction', category],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('predict_next_wave', {
        category_param: category,
        days_ahead: 30
      })

      if (error) {
        console.error('Error fetching prediction:', error)
        return null
      }

      return data && data.length > 0 ? data[0] : null
    },
    enabled: !!category
  })

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!prediction || prediction.probability < 0.5) return null

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          PATTERN-PREDICTION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2 text-muted-foreground">
          Basierend auf historischen Daten:
        </p>
        <div className="p-3 bg-background rounded-lg mb-3">
          <p className="font-semibold mb-1">{prediction.event_type}</p>
          <p className="text-sm text-muted-foreground mb-2">{prediction.date_range}</p>
          <Badge variant="default" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {Math.round(prediction.probability * 100)}% Wahrscheinlichkeit
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Bell className="h-4 w-4" />
          Notification aktivieren
        </Button>
      </CardContent>
    </Card>
  )
}
