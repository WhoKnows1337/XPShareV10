'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ScrollProgressOptions {
  /** Target element to track (defaults to document) */
  target?: React.RefObject<HTMLElement>
  /** Throttle scroll events (ms) */
  throttle?: number
  /** Offset from top before progress starts */
  offset?: number
}

interface ScrollProgressState {
  /** Progress from 0 to 1 */
  progress: number
  /** Progress as percentage (0-100) */
  percentage: number
  /** Current scroll position in pixels */
  scrollY: number
  /** Total scrollable height */
  scrollHeight: number
  /** Whether user is scrolling */
  isScrolling: boolean
  /** Scroll direction: 'up' | 'down' | null */
  direction: 'up' | 'down' | null
}

/**
 * Hook to track scroll progress with optimized performance
 *
 * @example
 * ```tsx
 * const { progress, percentage, direction } = useScrollProgress()
 *
 * // Use for header opacity
 * <header style={{ opacity: Math.min(1, progress * 2) }}>
 *
 * // Use for progress bar
 * <div style={{ width: `${percentage}%` }} />
 * ```
 */
export function useScrollProgress(options: ScrollProgressOptions = {}): ScrollProgressState {
  const { target, throttle = 16, offset = 0 } = options

  const [state, setState] = useState<ScrollProgressState>({
    progress: 0,
    percentage: 0,
    scrollY: 0,
    scrollHeight: 0,
    isScrolling: false,
    direction: null,
  })

  const lastScrollY = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const rafId = useRef<number | null>(null)
  const lastUpdate = useRef(0)

  const updateScrollState = useCallback(() => {
    const now = Date.now()
    if (now - lastUpdate.current < throttle) {
      return
    }
    lastUpdate.current = now

    let scrollY: number
    let scrollHeight: number
    let clientHeight: number

    if (target?.current) {
      scrollY = target.current.scrollTop
      scrollHeight = target.current.scrollHeight
      clientHeight = target.current.clientHeight
    } else {
      scrollY = window.scrollY
      scrollHeight = document.documentElement.scrollHeight
      clientHeight = window.innerHeight
    }

    const maxScroll = scrollHeight - clientHeight - offset
    const adjustedScrollY = Math.max(0, scrollY - offset)
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, adjustedScrollY / maxScroll)) : 0
    const direction = scrollY > lastScrollY.current ? 'down' : scrollY < lastScrollY.current ? 'up' : null

    lastScrollY.current = scrollY

    setState({
      progress,
      percentage: Math.round(progress * 100),
      scrollY,
      scrollHeight,
      isScrolling: true,
      direction,
    })

    // Clear previous timeout and set new one
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }
    scrollTimeout.current = setTimeout(() => {
      setState(prev => ({ ...prev, isScrolling: false }))
    }, 150)
  }, [target, throttle, offset])

  const handleScroll = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }
    rafId.current = requestAnimationFrame(updateScrollState)
  }, [updateScrollState])

  useEffect(() => {
    const element = target?.current || window

    // Initial calculation
    updateScrollState()

    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', handleScroll)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [target, handleScroll, updateScrollState])

  return state
}

/**
 * Hook to track when an element enters/exits the viewport
 *
 * @example
 * ```tsx
 * const ref = useRef(null)
 * const { isInView, hasBeenInView } = useElementInView(ref)
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     animate={isInView ? 'visible' : 'hidden'}
 *   />
 * )
 * ```
 */
export function useElementInView(
  ref: React.RefObject<HTMLElement>,
  options: {
    threshold?: number | number[]
    rootMargin?: string
    triggerOnce?: boolean
  } = {}
) {
  const { threshold = 0.1, rootMargin = '-100px', triggerOnce = true } = options

  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting

        if (inView) {
          setIsInView(true)
          setHasBeenInView(true)

          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, threshold, rootMargin, triggerOnce])

  return { isInView, hasBeenInView }
}

/**
 * Hook to get scroll position relative to a specific section
 *
 * @example
 * ```tsx
 * const sectionRef = useRef(null)
 * const { progress, isActive } = useSectionProgress(sectionRef)
 *
 * // progress goes from 0 (section enters) to 1 (section exits)
 * ```
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updateProgress = () => {
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate progress: 0 when section top enters viewport, 1 when section bottom exits
      const sectionTop = rect.top
      const sectionBottom = rect.bottom
      const sectionHeight = rect.height

      const isInView = sectionBottom > 0 && sectionTop < windowHeight

      if (isInView) {
        // Progress from when top enters to when bottom exits
        const totalTravel = windowHeight + sectionHeight
        const traveled = windowHeight - sectionTop
        const normalizedProgress = Math.max(0, Math.min(1, traveled / totalTravel))

        setProgress(normalizedProgress)
        setIsActive(true)
      } else {
        setIsActive(false)
        // Set progress to 0 if above viewport, 1 if below
        setProgress(sectionTop >= windowHeight ? 0 : 1)
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [ref])

  return { progress, isActive }
}

export default useScrollProgress
