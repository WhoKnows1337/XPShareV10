'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
}

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Generate stars
    const generateStars = () => {
      const stars: Star[] = []
      const count = Math.min(200, Math.floor((canvas.width * canvas.height) / 8000))

      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.3 + 0.1,
        })
      }

      starsRef.current = stars
    }

    generateStars()

    // Animation loop
    let time = 0
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      // Draw stars
      starsRef.current.forEach((star, index) => {
        // Twinkling effect
        const twinkle = Math.sin(time + index * 0.1) * 0.3
        const currentOpacity = Math.max(0.1, Math.min(1, star.opacity + twinkle))

        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Slow drift
        star.y += star.speed * 0.1
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Canvas for stars */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Center glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Secondary glow */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Bottom glow */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] blur-[100px]"
          style={{
            background: 'linear-gradient(to top, rgba(99, 102, 241, 0.1), transparent)',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </>
  )
}
