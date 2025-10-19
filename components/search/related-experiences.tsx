'use client'

/**
 * RelatedExperiences - Display related source experiences
 *
 * Shows top 5 matching experiences with preview and "load more" functionality
 * for unlimited exploration through the platform.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, MapPin, Calendar, TrendingUp, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Source } from '@/types/search5'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface RelatedExperiencesProps {
  sources: Source[]
  initialLimit?: number
  loadMoreIncrement?: number
  delay?: number
}

export function RelatedExperiences({
  sources,
  initialLimit = 5,
  loadMoreIncrement = 5,
  delay = 0
}: RelatedExperiencesProps) {
  const [visibleCount, setVisibleCount] = useState(initialLimit)

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + loadMoreIncrement, sources.length))
  }

  const visibleSources = sources.slice(0, visibleCount)
  const hasMore = visibleCount < sources.length
  const remainingCount = sources.length - visibleCount

  if (sources.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">
            Ähnliche Erfahrungen
          </h3>
          <Badge variant="secondary" className="font-mono">
            {sources.length}
          </Badge>
        </div>
      </div>

      {/* Experience Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleSources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link href={`/experiences/${source.id}`}>
                <Card className={cn(
                  "transition-all hover:shadow-lg hover:scale-[1.01] cursor-pointer",
                  "border-l-4",
                  index === 0 ? "border-l-blue-500" : "border-l-transparent"
                )}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base mb-1 line-clamp-2">
                            {source.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {source.category}
                            </Badge>
                            {source.similarity && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                <span>{Math.round(source.similarity * 100)}% Relevanz</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {source.excerpt || source.fullText?.substring(0, 200) + '...' || 'Keine Vorschau verfügbar'}
                      </p>

                      {/* Metadata Footer */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {source.date_occurred && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(source.date_occurred), {
                                addSuffix: true,
                                locale: de
                              })}
                            </span>
                          </div>
                        )}
                        {source.location_text && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{source.location_text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-2"
        >
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Weitere {Math.min(loadMoreIncrement, remainingCount)} laden
            <Badge variant="secondary" className="ml-1 font-mono text-xs">
              {remainingCount}
            </Badge>
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
