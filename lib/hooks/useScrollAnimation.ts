import { useScroll, useTransform, MotionValue } from 'framer-motion'
import { RefObject } from 'react'

interface ScrollAnimationConfig {
  scrollRange?: [number, number]
  outputRange?: [number, number]
}

export function useScrollAnimation(
  ref?: RefObject<HTMLElement>,
  config: ScrollAnimationConfig = {}
) {
  const { scrollRange = [0, 300], outputRange = [100, 0] } = config

  const { scrollY } = useScroll({
    target: ref,
  })

  const y = useTransform(scrollY, scrollRange, outputRange)
  const opacity = useTransform(scrollY, scrollRange, [0, 1])

  return { y, opacity, scrollY }
}

export function useParallaxScroll(speed: number = 0.5) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed])

  return y
}
