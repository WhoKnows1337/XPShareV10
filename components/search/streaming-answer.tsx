'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { RAGCitationLink } from './rag-citation-link'
import { Source } from '@/types/ai-answer'

interface StreamingAnswerProps {
  content: string
  sources: Source[]
  isStreaming: boolean
  className?: string
}

/**
 * Progressive renderer for AI-generated answers
 * Displays text as it streams and parses citations in real-time
 */
export function StreamingAnswer({ content, sources, isStreaming, className }: StreamingAnswerProps) {
  // Only parse complete sentences to avoid partial citation rendering
  const displayContent = useMemo(() => {
    if (!content) return ''

    // If streaming, only show complete sentences (ending with . ! ?)
    if (isStreaming) {
      const sentences = content.match(/[^.!?]+[.!?]+/g)
      if (sentences) {
        return sentences.join(' ')
      }
      // Fallback: show everything if no complete sentence yet
      return content
    }

    return content
  }, [content, isStreaming])

  return (
    <div className={className}>
      {/* Answer Text with Citations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="prose prose-sm dark:prose-invert max-w-none"
      >
        <RAGCitationLink
          answer={displayContent}
          sources={sources}
          className="whitespace-pre-wrap leading-relaxed"
        />

        {/* Typing Cursor (only while streaming) */}
        {isStreaming && (
          <motion.span
            className="inline-block w-1.5 h-5 ml-1 bg-blue-500"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  )
}
