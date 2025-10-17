'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface LoadingProgressBarProps {
  isLoading: boolean
  duration?: number // Duration for determinate mode (in ms)
}

/**
 * LoadingProgressBar - Top-of-viewport progress bar (YouTube/GitHub style)
 *
 * Features:
 * - Indeterminate sliding animation (default)
 * - Gradient (blue → purple)
 * - Auto-triggers on isLoading prop change
 * - Smooth completion animation (100% → fade out)
 * - Portal-based rendering at document.body
 * - Fixed position at top of viewport
 * - 2px height with glow effect
 *
 * Usage:
 * ```tsx
 * <LoadingProgressBar isLoading={isSearching} />
 * ```
 */
export function LoadingProgressBar({ isLoading, duration = 1000 }: LoadingProgressBarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20" />

          {/* Sliding progress bar */}
          <motion.div
            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 shadow-lg"
            initial={{ x: '-100%' }}
            animate={{
              x: ['0%', '300%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/**
 * Determinate version with percentage progress
 */
export function DeterminateProgressBar({
  progress,
  className,
}: {
  progress: number // 0-100
  className?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <motion.div className={`fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800" />

      {/* Progress bar */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* Completion glow */}
      {progress >= 100 && (
        <motion.div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-green-400 to-green-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>,
    document.body
  )
}
