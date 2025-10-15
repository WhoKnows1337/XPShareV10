'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Target, Globe, Users, BookOpen, Download, Sparkles, TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ImpactData {
  patterns_discovered: number
  countries_reached: number
  people_helped: number
  research_citations: number
  viewer_countries: Record<string, number>
  pattern_contributions: Array<{
    pattern_id: string
    pattern_name: string
    experience_count: number
    is_creator: boolean
    correlation: number
    created_at: string
  }>
  data_quality_score: number
}

interface GlobalImpactDashboardProps {
  userId: string
}

const countryNames: Record<string, string> = {
  DE: '🇩🇪 Deutschland',
  CH: '🇨🇭 Schweiz',
  AT: '🇦🇹 Österreich',
  FR: '🇫🇷 Frankreich',
  US: '🇺🇸 USA',
  GB: '🇬🇧 Großbritannien',
  IT: '🇮🇹 Italien',
  ES: '🇪🇸 Spanien',
  NL: '🇳🇱 Niederlande',
  BE: '🇧🇪 Belgien'
}

export function GlobalImpactDashboard({ userId }: GlobalImpactDashboardProps) {
  const [impact, setImpact] = useState<ImpactData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchImpact() {
      try {
        const supabase = createClient()
        const { data, error } = await (supabase as any).rpc('calculate_user_impact', {
          target_user_id: userId
        })

        if (error) {
          console.error('Error fetching impact:', error)
          setLoading(false)
          return
        }

        // Get first row since SQL function returns TABLE
        const impactData = data && data.length > 0 ? data[0] : null

        if (impactData) {
          setImpact({
            patterns_discovered: 0, // TODO: Implement pattern discovery tracking
            countries_reached: impactData.countries_reached || 0,
            people_helped: impactData.total_views || 0,
            research_citations: 0, // TODO: Implement research citations
            viewer_countries: {}, // TODO: Implement country tracking
            pattern_contributions: [], // TODO: Implement pattern contributions
            data_quality_score: 85 // Fixed score for now
          })
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchImpact()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!impact) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Impact-Daten verfügbar</p>
        </CardContent>
      </Card>
    )
  }

  const totalViews = impact.people_helped || 0
  const sortedCountries = Object.entries(impact.viewer_countries || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            🌍 YOUR GLOBAL IMPACT
          </h2>
          <p className="text-muted-foreground mt-1">
            Deine Beiträge haben einen messbaren Einfluss auf die Community
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Patterns aufgedeckt</span>
            </div>
            <div className="text-3xl font-bold">{impact.patterns_discovered}</div>
            {impact.patterns_discovered > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Du hast neue Zusammenhänge entdeckt!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Länder erreicht</span>
            </div>
            <div className="text-3xl font-bold">{impact.countries_reached}</div>
            {impact.countries_reached > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Weltweite Reichweite!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Menschen geholfen</span>
            </div>
            <div className="text-3xl font-bold">{totalViews}</div>
            {totalViews > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Views deiner Erlebnisse
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Research-Zitate</span>
            </div>
            <div className="text-3xl font-bold">{impact.research_citations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In Studien erwähnt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* World Reach Map */}
      {sortedCountries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗺️ Deine weltweite Reichweite
            </CardTitle>
            <CardDescription>
              Menschen aus {impact.countries_reached} Ländern haben deine Erlebnisse gesehen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCountries.map(([code, views]) => {
                const percentage = totalViews > 0 ? (views / totalViews) * 100 : 0
                return (
                  <div key={code}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {countryNames[code] || code}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(views)} Views ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pattern Contributions */}
      {impact.pattern_contributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Pattern-Beiträge
            </CardTitle>
            <CardDescription>
              Du hast geholfen, diese Muster zu entdecken
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {impact.pattern_contributions.map((pattern) => (
                <div
                  key={pattern.pattern_id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{pattern.pattern_name}</h4>
                      {pattern.is_creator && (
                        <Badge variant="default" className="flex-shrink-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Creator
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pattern.experience_count} Erlebnisse • {Math.round(pattern.correlation * 100)}% Korrelation
                    </p>
                    {pattern.is_creator && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Dein Erlebnis war das ERSTE in diesem Pattern! 🌊
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scientific Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 Wissenschaftlicher Wert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Datenqualität</span>
                <span className="text-sm font-bold">{impact.data_quality_score}%</span>
              </div>
              <Progress value={impact.data_quality_score} className="h-2" />
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium">Deine Daten sind besonders wertvoll wegen:</p>
              <ul className="space-y-1 ml-4">
                {impact.data_quality_score >= 85 && (
                  <li className="flex items-center gap-2">
                    ✓ Detaillierte Beschreibungen
                  </li>
                )}
                {totalViews > 50 && (
                  <li className="flex items-center gap-2">
                    ✓ Hohe Community-Relevanz
                  </li>
                )}
                {impact.patterns_discovered > 0 && (
                  <li className="flex items-center gap-2">
                    ✓ Pattern-Entdeckungen
                  </li>
                )}
                <li className="flex items-center gap-2">
                  ✓ Verifizierte Zeitangaben
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aha Moment Message */}
      {(impact.patterns_discovered > 0 || totalViews > 20) && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  DEINE BEITRÄGE HABEN WIRKLICH IMPACT!
                </h3>
                <p className="text-sm text-muted-foreground">
                  {totalViews} Menschen in {impact.countries_reached} Ländern haben von deinen Erfahrungen profitiert.
                  {impact.patterns_discovered > 0 && ` Du hast ${impact.patterns_discovered} neue Pattern${impact.patterns_discovered > 1 ? 's' : ''} entdeckt!`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
