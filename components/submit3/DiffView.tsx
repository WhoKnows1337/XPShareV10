'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface DiffViewProps {
  original: string
  enhanced: string
  showLineByLine?: boolean
}

interface DiffSegment {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

export function DiffView({ original, enhanced, showLineByLine = false }: DiffViewProps) {
  const diff = useMemo(() => computeDiff(original, enhanced), [original, enhanced])

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === 'added').length
    const removed = diff.filter((d) => d.type === 'removed').length
    const unchanged = diff.filter((d) => d.type === 'unchanged').length

    return { added, removed, unchanged, total: added + removed + unchanged }
  }, [diff])

  if (showLineByLine) {
    return (
      <div className="space-y-4">
        {/* Stats */}
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
            +{stats.added} additions
          </Badge>
          <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
            -{stats.removed} deletions
          </Badge>
          <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50">
            {stats.unchanged} unchanged
          </Badge>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Original */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Original</h3>
              <div className="space-y-1 font-mono text-sm">
                {diff.map((segment, idx) =>
                  segment.type === 'removed' || segment.type === 'unchanged' ? (
                    <motion.div
                      key={`orig-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      className={
                        segment.type === 'removed'
                          ? 'bg-red-100 text-red-900 px-1 line-through'
                          : 'text-gray-700'
                      }
                    >
                      {segment.text}
                    </motion.div>
                  ) : null
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Enhanced</h3>
              <div className="space-y-1 font-mono text-sm">
                {diff.map((segment, idx) =>
                  segment.type === 'added' || segment.type === 'unchanged' ? (
                    <motion.div
                      key={`enh-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      className={
                        segment.type === 'added'
                          ? 'bg-green-100 text-green-900 px-1 font-semibold'
                          : 'text-gray-700'
                      }
                    >
                      {segment.text}
                    </motion.div>
                  ) : null
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Inline unified diff
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-2">
        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
          +{stats.added} additions
        </Badge>
        <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
          -{stats.removed} deletions
        </Badge>
      </div>

      {/* Unified diff */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2 font-mono text-sm leading-relaxed">
            {diff.map((segment, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, x: segment.type === 'added' ? 10 : segment.type === 'removed' ? -10 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={
                  segment.type === 'added'
                    ? 'bg-green-100 text-green-900 px-1 py-0.5 rounded font-semibold'
                    : segment.type === 'removed'
                    ? 'bg-red-100 text-red-900 px-1 py-0.5 rounded line-through opacity-70'
                    : 'text-gray-700'
                }
              >
                {segment.text}
                {segment.type !== 'unchanged' && ' '}
              </motion.span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple word-level diff algorithm
function computeDiff(original: string, enhanced: string): DiffSegment[] {
  const originalWords = original.split(/(\s+)/)
  const enhancedWords = enhanced.split(/(\s+)/)

  const diff: DiffSegment[] = []

  // Simple diff: compare word by word
  let i = 0
  let j = 0

  while (i < originalWords.length || j < enhancedWords.length) {
    if (i >= originalWords.length) {
      // Remaining enhanced words are additions
      diff.push({ type: 'added', text: enhancedWords[j] })
      j++
    } else if (j >= enhancedWords.length) {
      // Remaining original words are removals
      diff.push({ type: 'removed', text: originalWords[i] })
      i++
    } else if (originalWords[i] === enhancedWords[j]) {
      // Words match
      diff.push({ type: 'unchanged', text: originalWords[i] })
      i++
      j++
    } else {
      // Words differ - check if it's a replacement
      const nextMatchInEnhanced = enhancedWords.slice(j).findIndex((w) => w === originalWords[i])
      const nextMatchInOriginal = originalWords.slice(i).findIndex((w) => w === enhancedWords[j])

      if (nextMatchInEnhanced !== -1 && nextMatchInEnhanced < 3) {
        // Word was added in enhanced
        diff.push({ type: 'added', text: enhancedWords[j] })
        j++
      } else if (nextMatchInOriginal !== -1 && nextMatchInOriginal < 3) {
        // Word was removed from original
        diff.push({ type: 'removed', text: originalWords[i] })
        i++
      } else {
        // Replacement: remove old, add new
        diff.push({ type: 'removed', text: originalWords[i] })
        diff.push({ type: 'added', text: enhancedWords[j] })
        i++
        j++
      }
    }
  }

  return diff
}
