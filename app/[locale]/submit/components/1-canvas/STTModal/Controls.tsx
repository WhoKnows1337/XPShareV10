'use client'

import { motion } from 'framer-motion'
import { Mic, Pause, Play, Square } from 'lucide-react'

interface ControlsProps {
  isRecording: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  duration: string
}

export const Controls = ({
  isRecording,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  duration,
}: ControlsProps) => {
  if (!isRecording) {
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-4 bg-red-500 text-white rounded-full font-medium shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Mic className="w-5 h-5" />
          <span>Aufnahme starten</span>
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-mono font-semibold text-gray-700">
        {duration}
      </div>

      <div className="flex items-center gap-3">
        {isPaused ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResume}
            className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
          >
            <Play className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPause}
            className="p-4 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
          >
            <Pause className="w-6 h-6" />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          className="p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <Square className="w-6 h-6" />
        </motion.button>
      </div>

      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500"
        >
          Aufnahme pausiert
        </motion.div>
      )}
    </div>
  )
}
