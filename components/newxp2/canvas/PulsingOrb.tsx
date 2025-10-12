'use client'

import { motion } from 'framer-motion'
import { OrbState } from '@/lib/stores/newxp2Store'

interface PulsingOrbProps {
  state: OrbState
  size?: number
  waveformData?: number[]
}

export function PulsingOrb({ state, size = 200, waveformData = [] }: PulsingOrbProps) {
  const getOrbAnimation = () => {
    switch (state) {
      case 'idle':
        return {
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }
      case 'listening':
        return {
          scale: [1, 1.2, 1],
          opacity: [0.9, 1, 0.9],
        }
      case 'thinking':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }
      case 'celebrating':
        return {
          scale: [1, 1.3, 1],
          opacity: [1, 0.8, 1],
        }
      default:
        return {}
    }
  }

  const getColors = () => {
    switch (state) {
      case 'idle':
        return {
          primary: 'from-blue-500 to-purple-500',
          glow: 'rgba(99, 102, 241, 0.5)',
        }
      case 'listening':
        return {
          primary: 'from-green-400 to-blue-500',
          glow: 'rgba(34, 197, 94, 0.6)',
        }
      case 'thinking':
        return {
          primary: 'from-yellow-400 to-orange-500',
          glow: 'rgba(251, 191, 36, 0.5)',
        }
      case 'celebrating':
        return {
          primary: 'from-pink-500 to-purple-500',
          glow: 'rgba(236, 72, 153, 0.6)',
        }
    }
  }

  const colors = getColors()
  const isListening = state === 'listening' && waveformData.length > 0

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
        animate={getOrbAnimation()}
        transition={{
          duration: state === 'thinking' ? 3 : 2,
          repeat: Infinity,
          ease: state === 'thinking' ? 'linear' : 'easeInOut',
        }}
      />

      {/* Middle glow */}
      <motion.div
        className="absolute inset-[10%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 80%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: state === 'listening' ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core orb */}
      {!isListening ? (
        <motion.div
          className={`absolute inset-[20%] rounded-full bg-gradient-to-br ${colors.primary}`}
          style={{
            boxShadow: `0 0 60px ${colors.glow}, inset 0 0 40px rgba(255, 255, 255, 0.2)`,
          }}
          animate={getOrbAnimation()}
          transition={{
            duration: state === 'thinking' ? 3 : 2,
            repeat: Infinity,
            ease: state === 'thinking' ? 'linear' : 'easeInOut',
          }}
        />
      ) : (
        <WaveformOrb data={waveformData} size={size * 0.6} colors={colors} />
      )}

      {/* Inner highlight */}
      <motion.div
        className="absolute top-[25%] left-[30%] w-[30%] h-[30%] rounded-full bg-white/30 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// ========================================
// WAVEFORM ORB (Voice mode)
// ========================================

interface WaveformOrbProps {
  data: number[]
  size: number
  colors: { primary: string; glow: string }
}

function WaveformOrb({ data, size, colors }: WaveformOrbProps) {
  const bars = 32
  const normalizedData = data.slice(0, bars).map((val) => Math.min(1, val / 255))

  return (
    <div
      className="absolute flex items-center justify-center gap-[2px]"
      style={{ width: size, height: size }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const amplitude = normalizedData[i] || Math.random() * 0.3
        const height = size * 0.4 * (0.3 + amplitude * 0.7)

        return (
          <motion.div
            key={i}
            className={`w-[3px] bg-gradient-to-t ${colors.primary} rounded-full`}
            style={{
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
            animate={{
              height: [height * 0.5, height, height * 0.5],
            }}
            transition={{
              duration: 0.3 + Math.random() * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}
