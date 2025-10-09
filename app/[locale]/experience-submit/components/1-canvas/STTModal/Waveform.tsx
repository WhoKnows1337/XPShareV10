'use client'

import { motion } from 'framer-motion'

interface WaveformProps {
  audioData: number[]
  isRecording: boolean
  isPaused: boolean
}

export const Waveform = ({ audioData, isRecording, isPaused }: WaveformProps) => {
  // Create visualization bars (40 bars)
  const bars = Array.from({ length: 40 }, (_, i) => {
    const dataIndex = Math.floor((i / 40) * audioData.length)
    const height = audioData[dataIndex] || 0
    return height
  })

  return (
    <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 flex items-center justify-center gap-1">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            isRecording && !isPaused
              ? 'bg-gradient-to-t from-blue-500 to-purple-500'
              : 'bg-gray-300'
          }`}
          animate={{
            height: isRecording && !isPaused
              ? `${Math.max(4, height * 100)}%`
              : '20%',
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
