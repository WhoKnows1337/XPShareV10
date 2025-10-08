'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, TrendingUp, Link as LinkIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface CrossCategoryConnection {
  category_a: string
  category_b: string
  correlation_strength: number
  experience_count: number
  pattern_description: string
  examples: Array<{
    id: string
    title: string
    category: string
    date_occurred: string
  }>
}

interface CrossCategoryInsightProps {
  userId: string
}

const CATEGORY_ICONS: Record<string, string> = {
  'ufo': '🛸',
  'paranormal': '👻',
  'dreams': '💭',
  'psychedelic': '🌈',
  'spiritual': '✨',
  'synchronicity': '🔮',
  'nde': '💫',
  'obe': '🌌',
  'other': '❓'
}

const CATEGORY_NAMES: Record<string, string> = {
  'ufo': 'UFO-Sichtung',
  'paranormal': 'Paranormal',
  'dreams': 'Träume',
  'psychedelic': 'Psychedelisch',
  'spiritual': 'Spirituell',
  'synchronicity': 'Synchronizität',
  'nde': 'Nahtoderfahrung',
  'obe': 'OBE',
  'other': 'Andere'
}

export function CrossCategoryInsight({ userId }: CrossCategoryInsightProps) {
  const [connections, setConnections] = useState<CrossCategoryConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAhaMessage, setShowAhaMessage] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<CrossCategoryConnection | null>(null)

  useEffect(() => {
    async function fetchCrossCategoryConnections() {
      try {
        const supabase = createClient()

        // Fetch user's experiences grouped by category
        const { data: experiences, error } = await supabase
          .from('experiences')
          .select('id, title, category, date_occurred, created_at')
          .eq('user_id', userId)
          .order('date_occurred', { ascending: false })

        if (error) {
          console.error('Error fetching experiences:', error)
          return
        }

        // Analyze cross-category patterns
        const categoryGroups = experiences?.reduce((acc, exp) => {
          if (!acc[exp.category]) {
            acc[exp.category] = []
          }
          acc[exp.category].push(exp)
          return acc
        }, {} as Record<string, typeof experiences>)

        const categories = Object.keys(categoryGroups || {})
        const foundConnections: CrossCategoryConnection[] = []

        // Find correlations between categories
        for (let i = 0; i < categories.length; i++) {
          for (let j = i + 1; j < categories.length; j++) {
            const catA = categories[i]
            const catB = categories[j]
            const expsA = categoryGroups![catA]
            const expsB = categoryGroups![catB]

            // Simple time-based correlation: experiences within 30 days
            const correlatedPairs = expsA.filter(expA => {
              return expsB.some(expB => {
                const dateA = new Date(expA.date_occurred || expA.created_at || new Date())
                const dateB = new Date(expB.date_occurred || expB.created_at || new Date())
                const diffDays = Math.abs((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24))
                return diffDays <= 30
              })
            })

            if (correlatedPairs.length >= 2) {
              const correlation = (correlatedPairs.length / Math.min(expsA.length, expsB.length)) * 100

              foundConnections.push({
                category_a: catA,
                category_b: catB,
                correlation_strength: Math.round(correlation),
                experience_count: correlatedPairs.length,
                pattern_description: generatePatternDescription(catA, catB, correlatedPairs.length),
                examples: [
                  ...expsA.slice(0, 1),
                  ...expsB.slice(0, 1)
                ] as any
              })
            }
          }
        }

        // Sort by correlation strength
        foundConnections.sort((a, b) => b.correlation_strength - a.correlation_strength)

        setConnections(foundConnections)

        // Show Aha message if strong connections found
        if (foundConnections.length > 0 && foundConnections[0].correlation_strength > 50) {
          setShowAhaMessage(true)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCrossCategoryConnections()
  }, [userId])

  function generatePatternDescription(catA: string, catB: string, count: number): string {
    const templates = [
      `${count} deiner ${CATEGORY_NAMES[catA]}-Erlebnisse traten kurz nach ${CATEGORY_NAMES[catB]}-Erfahrungen auf`,
      `Deine ${CATEGORY_NAMES[catA]} und ${CATEGORY_NAMES[catB]} Erlebnisse zeigen zeitliche Überschneidungen`,
      `Es gibt einen Zusammenhang zwischen deinen ${CATEGORY_NAMES[catA]} und ${CATEGORY_NAMES[catB]} Erfahrungen`
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Noch nicht genug Erlebnisse für Cross-Category-Analyse</p>
          <p className="text-sm mt-2">Teile Erlebnisse aus verschiedenen Kategorien!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Aha-Moment Message */}
      <AnimatePresence>
        {showAhaMessage && connections[0] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      DEINE {CATEGORY_NAMES[connections[0].category_a].toUpperCase()}-SICHTUNG KORRELIERT MIT DEINEM {CATEGORY_NAMES[connections[0].category_b].toUpperCase()}-ERLEBNIS!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Wir haben einen {connections[0].correlation_strength}% Zusammenhang zwischen deinen Erlebnissen gefunden.
                      Das könnte auf einen tieferen Pattern hinweisen! 🌊
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAhaMessage(false)}
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Cross-Category-Insights
          </CardTitle>
          <CardDescription>
            Wir haben Verbindungen zwischen deinen verschiedenen Erlebnissen gefunden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connections.map((connection, idx) => (
            <motion.div
              key={`${connection.category_a}-${connection.category_b}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedConnection(connection)}
            >
              {/* Categories */}
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {CATEGORY_ICONS[connection.category_a]} {CATEGORY_NAMES[connection.category_a]}
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline" className="text-base px-3 py-1">
                  {CATEGORY_ICONS[connection.category_b]} {CATEGORY_NAMES[connection.category_b]}
                </Badge>
              </div>

              {/* Correlation Strength */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Korrelation</span>
                  <span className="font-semibold">{connection.correlation_strength}%</span>
                </div>
                <Progress value={connection.correlation_strength} className="h-2" />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3">
                {connection.pattern_description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {connection.experience_count} verknüpfte Erlebnisse
                </span>
                {connection.correlation_strength > 70 && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Starke Verbindung
                  </Badge>
                )}
              </div>

              {/* Examples Preview */}
              {selectedConnection === connection && connection.examples.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t space-y-2"
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Beispiele:</p>
                  {connection.examples.map((example) => (
                    <Link
                      key={example.id}
                      href={`/experiences/${example.id}`}
                      className="block p-2 bg-muted/50 rounded hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[example.category]}</span>
                        <span className="text-sm font-medium">{example.title}</span>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
