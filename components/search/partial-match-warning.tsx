'use client'

/**
 * PartialMatchWarning - Warning when no exact keyword/tag matches found
 *
 * Shows user that results are based on semantic similarity only,
 * not exact keyword matches, to prevent hallucination confusion.
 */

import { motion } from 'framer-motion'
import { AlertTriangle, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface PartialMatchWarningProps {
  keywords: string[]
  delay?: number
}

export function PartialMatchWarning({ keywords, delay = 0 }: PartialMatchWarningProps) {
  const keywordDisplay = keywords.slice(0, 3).join(', ')

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Alert className="bg-amber-500/10 border-amber-500/30">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          Keine exakten Treffer gefunden
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <div className="space-y-2">
            <p>
              Keine Erfahrungen mit den Begriffen <span className="font-semibold">"{keywordDisplay}"</span> gefunden.
              Die folgenden Ergebnisse basieren auf <strong>semantischer Ähnlichkeit</strong> (themenverwandte Inhalte).
            </p>
            <div className="flex items-start gap-2 text-sm mt-2 pt-2 border-t border-amber-500/20">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Tipp:</strong> Versuche allgemeinere Begriffe oder überprüfe die Schreibweise.
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}
