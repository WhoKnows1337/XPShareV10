/**
 * Shared Animation Variants for Experience Detail V2
 *
 * Central animation library for consistent, orchestrated animations
 * across all Experience Detail components.
 */

import { Variants, Transition } from 'framer-motion'

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
}

export const smoothTransition: Transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier
}

export const quickTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
}

// =============================================================================
// BASIC ANIMATIONS
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
}

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// =============================================================================
// HERO ANIMATIONS
// =============================================================================

export const heroImageVariants: Variants = {
  hidden: { scale: 1.1, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const categoryPillVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
}

export const floatingHeaderVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

// =============================================================================
// AUTHOR & CONTENT ANIMATIONS
// =============================================================================

export const authorCardVariants: Variants = {
  hidden: { y: 30, opacity: 0, filter: 'blur(10px)' },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export const validationPillVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4 },
  },
}

export const validationPulse: Variants = {
  pulse: {
    scale: [1, 1.02, 1],
    boxShadow: [
      '0 0 0 0 rgba(139, 157, 195, 0)',
      '0 0 0 8px rgba(139, 157, 195, 0.3)',
      '0 0 0 0 rgba(139, 157, 195, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const storyRevealVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

// =============================================================================
// CARD ANIMATIONS
// =============================================================================

export const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const similarCardVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.2 },
  },
}

// =============================================================================
// ENGAGEMENT ANIMATIONS
// =============================================================================

export const engagementBarVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

export const likeButtonVariants: Variants = {
  idle: { scale: 1 },
  tap: {
    scale: [1, 1.3, 1],
    rotate: [0, -15, 15, 0],
    transition: { duration: 0.4 },
  },
  liked: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 },
  },
}

export const saveButtonVariants: Variants = {
  idle: { scale: 1 },
  tap: {
    scale: [1, 0.9, 1.1, 1],
    transition: { duration: 0.3 },
  },
}

// =============================================================================
// MEDIA ANIMATIONS
// =============================================================================

export const mediaGalleryVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const mediaThumbnailVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
}

export const lightboxVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

// =============================================================================
// CONTAINER ANIMATIONS (Staggered Children)
// =============================================================================

export const staggerContainer = (
  stagger: number = 0.1,
  delay: number = 0
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
})

export const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

// =============================================================================
// SCROLL-TRIGGERED ANIMATIONS
// =============================================================================

export const scrollRevealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export const scrollRevealScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// =============================================================================
// PROGRESS ANIMATIONS
// =============================================================================

export const progressBarVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  }),
}

export const circleProgressVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (progress: number) => ({
    pathLength: progress / 100,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: 'easeOut' },
      opacity: { duration: 0.3 },
    },
  }),
}

// =============================================================================
// UTILITY ANIMATIONS
// =============================================================================

export const expandCollapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
}

export const rotateChevronVariants: Variants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
}

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// =============================================================================
// VIEWPORT OPTIONS
// =============================================================================

export const defaultViewport = {
  once: true,
  margin: '-100px',
}

export const immediateViewport = {
  once: true,
  margin: '0px',
}

export const delayedViewport = {
  once: true,
  margin: '-200px',
}

// =============================================================================
// ACCESSIBILITY: REDUCED MOTION VARIANTS
// These are simplified animations for users who prefer reduced motion
// =============================================================================

/**
 * Returns instant animation variants for users with prefers-reduced-motion
 * Use with: const variants = prefersReducedMotion ? reducedMotionVariants : normalVariants
 */
export const reducedMotionFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
}

export const reducedMotionSlideIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
}

/**
 * Creates reduced motion variants from any standard variants
 * Strips transforms (y, x, scale, rotate) and keeps only opacity
 */
export function createReducedMotionVariants(originalVariants: Variants): Variants {
  const reduced: Record<string, { opacity: number; transition: { duration: number } }> = {}

  for (const key of Object.keys(originalVariants)) {
    const variant = originalVariants[key]
    if (typeof variant === 'object' && variant !== null && !Array.isArray(variant)) {
      const variantObj = variant as Record<string, unknown>
      // Keep only opacity, remove transforms
      reduced[key] = {
        opacity: typeof variantObj.opacity === 'number' ? variantObj.opacity : 1,
        transition: { duration: 0.01 },
      }
    }
  }

  return reduced as Variants
}

// =============================================================================
// PERFORMANCE: VIEWPORT OPTIONS WITH PRELOAD HINTS
// =============================================================================

/** For hero/above-the-fold content - animate immediately */
export const aboveFoldViewport = {
  once: true,
  amount: 0.1,
}

/** For content just below the fold - start early */
export const nearFoldViewport = {
  once: true,
  margin: '-50px',
  amount: 0.2,
}

/** For far below content - lazy load */
export const lazyViewport = {
  once: true,
  margin: '-150px',
  amount: 0.1,
}
