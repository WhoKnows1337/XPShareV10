'use client'

import { useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Calendar, MapPin, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Source {
  id: string
  title: string
  excerpt?: string
  category: string
  similarity: number
  date_occurred?: string
  location_text?: string
}

interface RAGCitationLinkProps {
  answer: string
  sources: Source[]
  className?: string
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    'ufo': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'nde': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'psychedelics': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'meditation': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'lucid-dream': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'other': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  }
  return colors[category] || colors.other
}

function CitationPopover({ citationNumber, source }: { citationNumber: number; source: Source | null }) {
  if (!source) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
        [Erfahrung #{citationNumber}]
      </span>
    )
  }

  const similarityPercentage = Math.round(source.similarity * 100)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-all hover:scale-105 hover:shadow-sm cursor-pointer"
        >
          [{citationNumber}]
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="max-w-2xl w-[calc(100vw-100px)] p-0 rounded-lg shadow-xl border-blue-200 dark:border-blue-800"
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4 space-y-3">
            {/* Header with Title & Category */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                  {source.title || 'Ohne Titel'}
                </h4>
                <Badge className={getCategoryColor(source.category)} variant="secondary">
                  {source.category}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {source.date_occurred && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(source.date_occurred).toLocaleDateString('de-DE')}</span>
                  </div>
                )}
                {source.location_text && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{source.location_text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-blue-100 dark:border-blue-900" />

            {/* Excerpt */}
            {source.excerpt && (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                {source.excerpt.substring(0, 200)}
                {source.excerpt.length > 200 && '...'}
              </p>
            )}

            {/* Similarity Score */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>Relevanz</span>
                </div>
                <span className="font-medium">{similarityPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${similarityPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 border-t border-blue-100 dark:border-blue-900">
              <Link href={`/experiences/${source.id}`} target="_blank" className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  Vollständige Erfahrung anzeigen
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}

export function RAGCitationLink({ answer, sources, className }: RAGCitationLinkProps) {
  // Parse answer text and replace citations with interactive components
  const parsedAnswer = useMemo(() => {
    // Regex to match [Erfahrung #X] patterns
    const citationRegex = /\[Erfahrung #(\d+)\]/g

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    // Find all citation matches
    while ((match = citationRegex.exec(answer)) !== null) {
      const fullMatch = match[0]
      const citationNumber = parseInt(match[1], 10)
      const matchIndex = match.index

      // Add text before the citation
      if (matchIndex > lastIndex) {
        parts.push(answer.substring(lastIndex, matchIndex))
      }

      // Find the corresponding source (citations are 1-indexed)
      const source = sources[citationNumber - 1] || null

      // Add citation component
      parts.push(
        <CitationPopover
          key={`citation-${citationNumber}-${matchIndex}`}
          citationNumber={citationNumber}
          source={source}
        />
      )

      lastIndex = matchIndex + fullMatch.length
    }

    // Add remaining text after last citation
    if (lastIndex < answer.length) {
      parts.push(answer.substring(lastIndex))
    }

    return parts
  }, [answer, sources])

  return (
    <div className={className}>
      {parsedAnswer.map((part, index) => (
        <span key={index}>{part}</span>
      ))}
    </div>
  )
}
