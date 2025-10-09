'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LiveTranscriptProps {
  text: string
}

export const LiveTranscript = ({ text }: LiveTranscriptProps) => {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        setShowCursor(false)
      }
    }, 30) // 30ms per character

    return () => clearInterval(timer)
  }, [text])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-24 p-4 bg-gray-50 rounded-lg border border-gray-200"
    >
      <div className="text-sm text-gray-500 mb-2">Live-Transkript:</div>
      <div className="text-lg text-gray-900 leading-relaxed">
        {displayedText}
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="ml-1"
          >
            |
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}
