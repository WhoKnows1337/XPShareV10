'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Bell } from 'lucide-react'

interface PatternPrediction {
  event_type: string
  date_range: string
  probability: number
}

export function PatternPredictionCard({ category = 'UFO' }: { category?: string }) {
  const [prediction, setPrediction] = useState<PatternPrediction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrediction()
  }, [category])

  const fetchPrediction = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pattern-prediction?category=${encodeURIComponent(category)}`)
      const data = await response.json()

      if (response.ok && data.prediction && data.prediction.probability >= 0.5) {
        setPrediction(data.prediction)
      } else {
        setPrediction(null)
      }
    } catch (err) {
      console.error('Error fetching pattern prediction:', err)
      setPrediction(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            🔮 PATTERN-PREDICTION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-blue-100 rounded w-3/4" />
            <div className="h-16 bg-blue-100 rounded" />
            <div className="h-8 bg-blue-100 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prediction || prediction.probability < 0.5) {
    return null
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500 animate-pulse" />
          🔮 PATTERN-PREDICTION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Basierend auf historischen Daten:
        </p>

        <div className="p-3 bg-background rounded-lg border-2 border-blue-200 space-y-2">
          <p className="font-semibold text-base">
            {prediction.event_type}
          </p>
          <p className="text-sm font-medium text-blue-700">
            📅 {prediction.date_range}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-blue-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${prediction.probability * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-blue-700">
              {(prediction.probability * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Wahrscheinlichkeit für erhöhte Aktivität
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-blue-300 hover:bg-blue-50"
        >
          <Bell className="h-4 w-4 mr-2" />
          Notification aktivieren
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          KI-Vorhersage basierend auf 2-Jahres-Analyse
        </p>
      </CardContent>
    </Card>
  )
}
