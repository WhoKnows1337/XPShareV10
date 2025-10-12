'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function ConfettiEffect() {
  useEffect(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Fire from center
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.4, 0.6), y: randomInRange(0.4, 0.6) },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return null
}
