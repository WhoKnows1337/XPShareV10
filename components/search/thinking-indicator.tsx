'use client'

import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { StreamingState } from '@/types/ai-answer'

interface ThinkingIndicatorProps {
  state?: StreamingState
  className?: string
}

/**
 * Loading indicator for AI answer generation
 * Shows different messages based on current state
 */
export function ThinkingIndicator({ state = 'generating_answer', className }: ThinkingIndicatorProps) {
  const stateMessages: Record<StreamingState, string> = {
    idle: 'Bereit...',
    generating_embedding: 'Analysiere Frage...',
    searching: 'Suche relevante Erfahrungen...',
    generating_answer: 'AI denkt nach...',
    complete: 'Fertig!',
    error: 'Fehler aufgetreten',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {/* Main Loading Card */}
      <div className="border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          {/* Spinning Loader */}
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin flex-shrink-0 mt-1" />

          <div className="flex-1 space-y-4">
            {/* Status Message */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {stateMessages[state]}
              </p>

              {/* Animated Dots */}
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>

            {/* Progress Steps */}
            {state === 'generating_answer' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span>Embedding generiert</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span>Relevante Erfahrungen gefunden</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-500 font-medium">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span>Generiere Antwort...</span>
                </div>
              </div>
            )}

            {/* Shimmer Lines (while generating) */}
            {state === 'generating_answer' && (
              <div className="space-y-2 mt-4">
                <div className="h-4 skeleton-shimmer rounded w-full" />
                <div className="h-4 skeleton-shimmer rounded w-11/12" />
                <div className="h-4 skeleton-shimmer rounded w-10/12" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for shimmer effect */}
      <style jsx global>{`
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(229, 231, 235, 0.4) 0%,
            rgba(229, 231, 235, 0.8) 50%,
            rgba(229, 231, 235, 0.4) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .dark .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(55, 65, 81, 0.4) 0%,
            rgba(55, 65, 81, 0.8) 50%,
            rgba(55, 65, 81, 0.4) 100%
          );
          background-size: 200% 100%;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </motion.div>
  )
}
