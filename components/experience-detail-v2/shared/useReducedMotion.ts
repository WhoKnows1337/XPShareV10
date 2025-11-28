'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if the user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 *
 * return (
 *   <motion.div
 *     variants={prefersReducedMotion ? reducedMotionFadeIn : fadeInUp}
 *     initial="hidden"
 *     animate="visible"
 *   >
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useReducedMotion(): boolean {
  // Default to false on server (assume motion is OK)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if the API is available
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Returns animation props based on reduced motion preference
 * Useful for inline animation configuration
 *
 * @example
 * ```tsx
 * const animationProps = useMotionProps()
 *
 * return (
 *   <motion.div
 *     initial={animationProps.initial}
 *     animate={animationProps.animate}
 *     transition={animationProps.transition}
 *   >
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useMotionProps(options: {
  y?: number
  x?: number
  scale?: number
  duration?: number
} = {}) {
  const prefersReducedMotion = useReducedMotion()
  const { y = 20, x = 0, scale = 1, duration = 0.5 } = options

  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.01 },
    }
  }

  return {
    initial: { opacity: 0, y, x, scale },
    animate: { opacity: 1, y: 0, x: 0, scale: 1 },
    transition: { duration, ease: 'easeOut' },
  }
}

export default useReducedMotion
