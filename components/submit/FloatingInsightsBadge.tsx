'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiveInsightsSidebar } from './LiveInsightsSidebar'

interface FloatingInsightsBadgeProps {
  analysis: any
  isAnalyzing: boolean
  callCount: number
  maxCalls: number
}

export function FloatingInsightsBadge({
  analysis,
  isAnalyzing,
  callCount,
  maxCalls,
}: FloatingInsightsBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const insightCount = getInsightCount(analysis)
  const shouldPulse = isAnalyzing || (analysis && insightCount > 0)

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <motion.div
            className="fixed bottom-6 right-6 z-50 md:hidden"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Button
              size="lg"
              className="h-16 w-16 rounded-full shadow-lg relative"
              variant={insightCount > 0 ? 'default' : 'secondary'}
            >
              {/* Pulse Animation */}
              <AnimatePresence>
                {shouldPulse && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-500/30"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ scale: 1, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <Sparkles className="h-6 w-6 relative z-10" />

              {/* Count Badge */}
              {insightCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center border-2 border-background"
                >
                  {insightCount}
                </motion.div>
              )}
            </Button>
          </motion.div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Live Insights
            </SheetTitle>
            <SheetDescription>
              AI-powered insights about your experience
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <LiveInsightsSidebar
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              callCount={callCount}
              maxCalls={maxCalls}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function getInsightCount(analysis: any): number {
  if (!analysis) return 0

  let count = 0
  if (analysis.category) count++
  if (analysis.location?.name) count++
  if (analysis.time?.date) count++
  if (analysis.emotion) count++
  if (analysis.tags?.length > 0) count++
  if (analysis.similarCount > 0) count++
  if (analysis.externalEvents?.length > 0) count++

  return count
}
