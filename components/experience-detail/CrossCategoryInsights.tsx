'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface CrossCategoryInsight {
  category_name: string
  category_slug: string
  category_icon: string
  correlation: number
}

interface CrossCategoryInsightsProps {
  insights: CrossCategoryInsight[]
  currentCategory: string
}

const categoryEmojis: Record<string, string> = {
  ufo: '🛸',
  paranormal: '👻',
  dreams: '💭',
  psychedelic: '🌈',
  spiritual: '✨',
  synchronicity: '🔄',
  nde: '💫',
  other: '❓',
}

export function CrossCategoryInsights({ insights, currentCategory }: CrossCategoryInsightsProps) {
  if (insights.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Cross-Pattern Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Menschen die <strong>{currentCategory}</strong>-Erlebnisse haben, berichten auch:
          </p>

          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <motion.div
                key={insight.category_slug}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <Link
                  href={`/categories/${insight.category_slug}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-accent transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">
                        {categoryEmojis[insight.category_slug] || insight.category_icon}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {insight.category_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {insight.correlation}x häufiger als Durchschnitt
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={insight.correlation >= 3 ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {insight.correlation}x
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-3">
              💡 <strong>Aha-Moment:</strong> Diese Korrelationen basieren auf echten Nutzerdaten und zeigen
              überraschende Verbindungen zwischen verschiedenen Erlebnistypen.
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/patterns">
                <Brain className="w-4 h-4 mr-2" />
                Alle Pattern erkunden
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
