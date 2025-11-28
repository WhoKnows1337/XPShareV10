'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
// Direct imports to avoid webpack hydration issues with barrel exports
import { pageContainerVariants, reducedMotionFadeIn } from '@/components/experience-detail-v2/shared/animations'
import { useReducedMotion } from '@/components/experience-detail-v2/shared/useReducedMotion'

interface ExperienceDetailPageClientProps {
  children: ReactNode
}

/**
 * Client wrapper for Experience Detail Page V2
 *
 * Provides Framer Motion animation context for orchestrated page entry animations.
 * Respects user's reduced-motion preference for accessibility.
 */
export function ExperienceDetailPageClient({ children }: ExperienceDetailPageClientProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={prefersReducedMotion ? reducedMotionFadeIn : pageContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}
