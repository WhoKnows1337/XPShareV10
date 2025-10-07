'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Bell, Zap, Calendar } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Prediction {
  event_type: string
  date_range: string
  probability: number
  peak_date: string
  predicted_count: number
}

interface PatternPredictionCardProps {
  category?: string
}

export function PatternPredictionCard({ category }: PatternPredictionCardProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationEnabled, setNotificationEnabled] = useState(false)

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('predict_next_wave', {
          p_category: category || null
        })

        if (error) {
          console.error('Error fetching prediction:', error)
          setLoading(false)
          return
        }

        if (data && data.length > 0 && data[0].probability >= 0.5) {
          setPrediction(data[0])
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [category])

  const handleEnableNotification = () => {
    // TODO: Implement notification subscription
    setNotificationEnabled(true)
    // Could save to localStorage or database
    localStorage.setItem(`prediction_notify_${prediction?.peak_date}`, 'true')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            🔮 PATTERN-PREDICTION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prediction) {
    return null
  }

  const probabilityPercentage = Math.round(prediction.probability * 100)
  const isHighProbability = probabilityPercentage >= 70

  return (
    <Card className={isHighProbability ? "border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent" : "border-primary/20"}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          🔮 PATTERN-PREDICTION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prediction Info */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Basierend auf historischen Daten:
          </p>
          <div className="p-4 bg-background rounded-lg border space-y-3">
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {prediction.event_type}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {prediction.date_range}
                  </p>
                </div>
              </div>
            </div>

            {/* Probability */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Wahrscheinlichkeit</span>
                <Badge
                  variant={isHighProbability ? "default" : "secondary"}
                  className="font-bold"
                >
                  {probabilityPercentage}%
                </Badge>
              </div>
              <Progress
                value={probabilityPercentage}
                className="h-2"
              />
            </div>

            {/* Predicted Count */}
            {prediction.predicted_count > 0 && (
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Erwartete Berichte:</span>
                <span className="font-semibold">{prediction.predicted_count}+</span>
              </div>
            )}
          </div>
        </div>

        {/* Notification CTA */}
        {!notificationEnabled ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleEnableNotification}
          >
            <Bell className="w-4 h-4 mr-2" />
            Benachrichtigung aktivieren
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Bell className="w-4 h-4" />
            <span>Benachrichtigung aktiv ✓</span>
          </div>
        )}

        {/* Aha Moment for high probability */}
        {isHighProbability && (
          <div className="pt-3 border-t">
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  Sehr hohe Vorhersage-Genauigkeit!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pattern zeigt starke Korrelation mit historischen Daten
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Context */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="flex items-center gap-1">
            <span className="text-primary">•</span>
            Analyse basiert auf {category ? 'Kategorie-' : ''}Daten der letzten 2 Jahre
          </p>
          <p className="flex items-center gap-1">
            <span className="text-primary">•</span>
            Berücksichtigt saisonale Muster und aktuelle Trends
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
