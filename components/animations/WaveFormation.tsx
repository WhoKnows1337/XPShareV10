'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface WaveFormationProps {
  experienceCount: number
  patternName?: string
  onComplete?: () => void
  className?: string
}

export function WaveFormation({
  experienceCount,
  patternName = 'Wave',
  onComplete,
  className
}: WaveFormationProps) {
  const [phase, setPhase] = useState<'scatter' | 'converge' | 'wave'>('scatter')

  useEffect(() => {
    const scatterTimer = setTimeout(() => setPhase('converge'), 1000)
    const convergeTimer = setTimeout(() => setPhase('wave'), 2500)
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 4000)

    return () => {
      clearTimeout(scatterTimer)
      clearTimeout(convergeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  // Generate random positions for particles
  const particles = Array.from({ length: Math.min(experienceCount, 20) }, (_, i) => ({
    id: i,
    initialX: Math.random() * 400 - 200,
    initialY: Math.random() * 400 - 200,
    finalX: Math.cos((i / experienceCount) * Math.PI * 2) * 80,
    finalY: Math.sin((i / experienceCount) * Math.PI * 2) * 80,
  }))

  return (
    <div className={cn('relative w-full h-[500px] flex items-center justify-center overflow-hidden', className)}>
      {/* Background Wave Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"
        animate={{
          scale: phase === 'wave' ? [1, 1.2, 1] : 1,
          opacity: phase === 'wave' ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{
          duration: 3,
          repeat: phase === 'wave' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Particles (Experiences) */}
      <div className="relative">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute h-3 w-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: phase === 'scatter' ? particle.initialX : phase === 'converge' ? particle.finalX : particle.finalX,
              y: phase === 'scatter' ? particle.initialY : phase === 'converge' ? particle.finalY : particle.finalY,
              scale: phase === 'scatter' ? 1 : phase === 'converge' ? 1.2 : 1.5,
              opacity: phase === 'scatter' ? 1 : phase === 'converge' ? 1 : 0.8,
            }}
            transition={{
              duration: phase === 'scatter' ? 0.8 : phase === 'converge' ? 1.5 : 2,
              delay: particle.id * 0.05,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Central Wave Symbol */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: phase === 'wave' ? [0, 1.2, 1] : 0,
            opacity: phase === 'wave' ? [0, 1, 1] : 0,
            rotate: phase === 'wave' ? [0, 360] : 0,
          }}
          transition={{
            duration: 2,
            repeat: phase === 'wave' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <div className="relative">
            {/* Wave Ripples */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-500/40"
                animate={{
                  width: phase === 'wave' ? [0, 200, 400] : 0,
                  height: phase === 'wave' ? [0, 200, 400] : 0,
                  opacity: phase === 'wave' ? [0.8, 0.4, 0] : 0,
                }}
                transition={{
                  duration: 3,
                  repeat: phase === 'wave' ? Infinity : 0,
                  delay: i * 0.6,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Central Icon */}
            <motion.div
              className="relative z-10 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
              animate={phase === 'wave' ? {
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.5)',
                  '0 0 40px rgba(168, 85, 247, 0.8)',
                  '0 0 20px rgba(168, 85, 247, 0.5)',
                ],
              } : {}}
              transition={{
                duration: 2,
                repeat: phase === 'wave' ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              🌊
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Pattern Label */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: phase === 'wave' ? 1 : 0,
          y: phase === 'wave' ? 0 : 20,
        }}
        transition={{ duration: 1, delay: 2 }}
      >
        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {patternName} Pattern Erkannt!
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {experienceCount} ähnliche Erfahrungen bilden dieses Muster
        </p>
      </motion.div>
    </div>
  )
}
