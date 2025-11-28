'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'

interface ParallaxOptions {
  /** Parallax intensity (0-1, default 0.3) */
  intensity?: number
  /** Direction of parallax effect */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** Use spring physics for smoother motion */
  useSpringPhysics?: boolean
  /** Spring stiffness (default 100) */
  stiffness?: number
  /** Spring damping (default 30) */
  damping?: number
  /** Offset range for the effect [start, end] */
  offsetRange?: [string, string]
}

interface ParallaxResult {
  ref: React.RefObject<HTMLDivElement | null>
  y: MotionValue<number>
  x: MotionValue<number>
  scale: MotionValue<number>
  opacity: MotionValue<number>
  progress: MotionValue<number>
}

/**
 * Hook for parallax scrolling effects using Framer Motion
 *
 * @example
 * ```tsx
 * const { ref, y } = useParallax({ intensity: 0.3 })
 *
 * return (
 *   <motion.div ref={ref} style={{ y }}>
 *     <Image src="hero.jpg" />
 *   </motion.div>
 * )
 * ```
 */
export function useParallax(options: ParallaxOptions = {}): ParallaxResult {
  const {
    intensity = 0.3,
    direction = 'up',
    useSpringPhysics = true,
    stiffness = 100,
    damping = 30,
    offsetRange = ['start end', 'end start'],
  } = options

  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offsetRange as ['start end', 'end start'],
  })

  // Calculate movement range based on intensity
  const movement = intensity * 100 // Convert to pixels

  // Create transforms based on direction
  let yOutput: [number, number] = [0, 0]
  let xOutput: [number, number] = [0, 0]

  switch (direction) {
    case 'up':
      yOutput = [movement, -movement]
      break
    case 'down':
      yOutput = [-movement, movement]
      break
    case 'left':
      xOutput = [movement, -movement]
      break
    case 'right':
      xOutput = [-movement, movement]
      break
  }

  const rawY = useTransform(scrollYProgress, [0, 1], yOutput)
  const rawX = useTransform(scrollYProgress, [0, 1], xOutput)

  // Always call useSpring unconditionally (React hooks rules)
  const springY = useSpring(rawY, { stiffness, damping })
  const springX = useSpring(rawX, { stiffness, damping })

  // Select which value to use based on the option
  const y = useSpringPhysics ? springY : rawY
  const x = useSpringPhysics ? springX : rawX

  // Additional transforms that might be useful
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  return {
    ref,
    y,
    x,
    scale,
    opacity,
    progress: scrollYProgress,
  }
}

/**
 * Hook for Ken Burns effect (slow zoom on images)
 *
 * @example
 * ```tsx
 * const { ref, scale } = useKenBurns({ duration: 20 })
 *
 * return (
 *   <motion.div ref={ref} style={{ scale }}>
 *     <Image src="hero.jpg" />
 *   </motion.div>
 * )
 * ```
 */
export function useKenBurns(options: {
  duration?: number
  scaleRange?: [number, number]
  direction?: 'in' | 'out' | 'both'
} = {}) {
  const { duration = 20, scaleRange = [1, 1.05], direction = 'both' } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  // Create animation variant based on direction
  const getAnimation = () => {
    switch (direction) {
      case 'in':
        return {
          scale: scaleRange,
          transition: { duration, ease: 'linear' },
        }
      case 'out':
        return {
          scale: [...scaleRange].reverse(),
          transition: { duration, ease: 'linear' },
        }
      case 'both':
      default:
        return {
          scale: [...scaleRange, scaleRange[0]],
          transition: {
            duration: duration * 2,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse' as const,
          },
        }
    }
  }

  return {
    ref,
    isInView,
    animate: isInView ? getAnimation() : {},
    initial: { scale: scaleRange[0] },
  }
}

/**
 * Hook for scroll-based fade and reveal
 *
 * @example
 * ```tsx
 * const { ref, opacity, y } = useScrollFade()
 *
 * return (
 *   <motion.div ref={ref} style={{ opacity, y }}>
 *     Content fades in as you scroll
 *   </motion.div>
 * )
 * ```
 */
export function useScrollFade(options: {
  fadeStart?: number
  fadeEnd?: number
  translateY?: number
} = {}) {
  const { fadeStart = 0.2, fadeEnd = 0.8, translateY = 30 } = options

  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(
    scrollYProgress,
    [0, fadeStart, fadeEnd, 1],
    [0, 1, 1, 0]
  )

  const y = useTransform(
    scrollYProgress,
    [0, fadeStart, fadeEnd, 1],
    [translateY, 0, 0, -translateY]
  )

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 })

  return {
    ref,
    opacity: smoothOpacity,
    y: smoothY,
    progress: scrollYProgress,
  }
}

/**
 * Hook for sticky header that shows/hides on scroll
 *
 * @example
 * ```tsx
 * const { isVisible, isAtTop, headerStyle } = useStickyHeader()
 *
 * return (
 *   <motion.header
 *     animate={isVisible ? 'visible' : 'hidden'}
 *     style={headerStyle}
 *   />
 * )
 * ```
 */
export function useStickyHeader(options: {
  threshold?: number
  hideOnScrollDown?: boolean
} = {}) {
  const { threshold = 50, hideOnScrollDown = true } = options

  const [isVisible, setIsVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY

    // Check if at top
    setIsAtTop(currentScrollY < threshold)

    // Show/hide based on scroll direction
    if (hideOnScrollDown) {
      if (currentScrollY < lastScrollY.current || currentScrollY < threshold) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY.current && currentScrollY > threshold) {
        setIsVisible(false)
      }
    }

    lastScrollY.current = currentScrollY
  }, [threshold, hideOnScrollDown])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const headerStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  }

  return {
    isVisible,
    isAtTop,
    headerStyle,
    variants: {
      visible: { y: 0, opacity: 1 },
      hidden: { y: -100, opacity: 0 },
    },
  }
}

/**
 * Hook for mouse parallax effect (element follows cursor)
 *
 * @example
 * ```tsx
 * const { ref, x, y } = useMouseParallax({ intensity: 0.1 })
 *
 * return (
 *   <motion.div ref={ref} style={{ x, y }}>
 *     Element subtly follows mouse
 *   </motion.div>
 * )
 * ```
 */
export function useMouseParallax(options: {
  intensity?: number
  useSpringPhysics?: boolean
} = {}) {
  const { intensity = 0.1, useSpringPhysics = true } = options

  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) * intensity
      const deltaY = (e.clientY - centerY) * intensity

      setPosition({ x: deltaX, y: deltaY })
    }

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity])

  const springX = useSpring(position.x, { stiffness: 150, damping: 15 })
  const springY = useSpring(position.y, { stiffness: 150, damping: 15 })

  return {
    ref,
    x: useSpringPhysics ? springX : position.x,
    y: useSpringPhysics ? springY : position.y,
  }
}

export default useParallax
