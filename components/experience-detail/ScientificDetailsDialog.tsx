'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ExternalLink, Sun, Moon, Cloud, Zap } from 'lucide-react'
import type { ExternalEvent } from '@/lib/api/external-events'

interface ScientificDetailsDialogProps {
  externalEvents: ExternalEvent[]
  dateOccurred?: string
  locationText?: string
}

export function ScientificDetailsDialog({
  externalEvents,
  dateOccurred,
  locationText,
}: ScientificDetailsDialogProps) {
  const solarEvents = externalEvents.filter((e) => e.type === 'solar')
  const moonEvents = externalEvents.filter((e) => e.type === 'moon')
  const weatherEvents = externalEvents.filter((e) => e.type === 'weather')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0">
          Scientific Details →
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Scientific & Environmental Data
          </DialogTitle>
          <DialogDescription>
            External factors and environmental conditions at the time and location of this experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Context Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {dateOccurred && (
                  <div>
                    <p className="text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {new Date(dateOccurred).toLocaleString('de-DE', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                )}
                {locationText && (
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{locationText}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Solar Activity */}
          {solarEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Solar Activity</h3>
                <Badge variant="outline">{solarEvents.length}</Badge>
              </div>
              <div className="space-y-3">
                {solarEvents.map((event, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.name}</h4>
                          <Badge
                            variant={
                              event.intensity > 70
                                ? 'destructive'
                                : event.intensity > 40
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {event.intensity > 70 ? 'High' : event.intensity > 40 ? 'Moderate' : 'Low'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">KP Index</p>
                            <p className="font-medium text-lg">{event.kp_index}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Intensity</p>
                            <div className="mt-1">
                              <Progress value={event.intensity} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.intensity}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground text-sm">Time</p>
                          <p className="text-sm">
                            {new Date(event.timestamp).toLocaleString('de-DE', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground">
                            Solar storms can affect electromagnetic fields and have been correlated
                            with increased reports of unusual phenomena.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Lunar Data */}
          {moonEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold">Lunar Data</h3>
              </div>
              <div className="space-y-3">
                {moonEvents.map((event, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.name}</h4>
                          <Badge variant="secondary">{event.phase}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Illumination</p>
                            <p className="font-medium text-lg">{event.illumination}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phase</p>
                            <p className="font-medium">{event.phase}</p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground">
                            Lunar phases have been historically associated with changes in sleep
                            patterns, mood, and perception.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Weather Data */}
          {weatherEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">Weather Conditions</h3>
              </div>
              <div className="space-y-3">
                {weatherEvents.map((event, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.name}</h4>
                          <Badge variant="outline">{event.temperature}°C</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Temperature</p>
                            <p className="font-medium">{event.temperature}°C</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cloud Cover</p>
                            <p className="font-medium">{event.clouds}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Wind Speed</p>
                            <p className="font-medium">{event.wind_speed} km/h</p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground">
                            Weather conditions can affect visibility, atmospheric phenomena, and
                            environmental factors relevant to the experience.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Data Available */}
          {externalEvents.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No scientific data available</p>
                  <p className="text-sm mt-1">
                    Location and date information needed to fetch environmental data
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Sources */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Data Sources:</p>
            <div className="flex flex-col gap-1">
              <a
                href="https://www.swpc.noaa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                NOAA Space Weather Prediction Center (Solar Data)
              </a>
              <a
                href="https://openweathermap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                OpenWeatherMap (Weather Data)
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
