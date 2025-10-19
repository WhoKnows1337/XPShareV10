'use client'

/**
 * SummaryCard - Natural language answer summary
 *
 * Displays the AI-generated summary as a readable text response
 * above the pattern cards.
 */

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface SummaryCardProps {
  summary: string
  delay?: number
}

export function SummaryCard({ summary, delay = 0 }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/20 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>

            {/* Summary Text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Antwort
              </h3>
              <p className="text-base leading-relaxed text-foreground">
                {summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
