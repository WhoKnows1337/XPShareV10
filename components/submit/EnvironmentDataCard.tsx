'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cloud, Moon, Sun, Wind, Droplets, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useEnvironmentData } from '@/lib/hooks/useEnvironmentData'
import { motion } from 'framer-motion'

interface EnvironmentDataCardProps {
  timestamp: string | null
  coordinates?: [number, number] | null
  className?: string
}

export function EnvironmentDataCard({
  timestamp,
  coordinates,
  className,
}: EnvironmentDataCardProps) {
  const { data, isLoading, error } = useEnvironmentData(timestamp, coordinates)

  if (!timestamp) return null

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Umgebungsdaten konnten nicht geladen werden
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          Umgebungsdaten
        </CardTitle>
        <CardDescription>
          Automatisch erfasste Daten zum Zeitpunkt der Sichtung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weather */}
        {data.weather && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-start gap-3">
              <Cloud className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Wetter</p>
                  <Badge variant="outline">{data.weather.condition}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    {data.weather.temperature}°C
                  </div>
                  <div className="flex items-center gap-1">
                    <Cloud className="h-3 w-3" />
                    {data.weather.clouds}% Wolken
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {data.weather.wind} km/h
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {data.weather.humidity}% Luftf.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Moon Phase */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-muted/50 border border-border/50"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{data.moon.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">Mondphase</p>
                <Badge variant="outline">{data.moon.illumination}%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{data.moon.phase}</p>
            </div>
          </div>
        </motion.div>

        {/* Solar Activity */}
        {data.solar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm text-orange-600 dark:text-orange-400">
                    Solar-Aktivität
                  </p>
                  <Badge variant="outline" className="border-orange-500/50">
                    {data.solar.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{data.solar.activity}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div>KP-Index: {data.solar.kpIndex}</div>
                  <div>
                    {data.solar.hoursBeforeEvent}h {data.solar.hoursBeforeEvent > 0 ? 'vor' : 'nach'}{' '}
                    Ereignis
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-orange-500/10 border border-orange-500/20">
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    💡 Interessant: Viele UFO-Sichtungen korrelieren mit erhöhter Solar-Aktivität
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            ✓ Korrekt
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            ✎ Korrigieren
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
