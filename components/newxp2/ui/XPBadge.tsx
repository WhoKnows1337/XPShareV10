'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'

interface XPBadgeProps {
  totalXP: number
}

export function XPBadge({ totalXP }: XPBadgeProps) {
  const [prevXP, setPrevXP] = useState(totalXP)
  const [showGain, setShowGain] = useState(false)
  const [xpGain, setXPGain] = useState(0)

  useEffect(() => {
    if (totalXP > prevXP) {
      const gain = totalXP - prevXP
      setXPGain(gain)
      setShowGain(true)
      setPrevXP(totalXP)

      const timer = setTimeout(() => {
        setShowGain(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [totalXP, prevXP])

  return (
    <div className="fixed top-6 left-6 z-50">
      <motion.div
        className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <Sparkles className="w-4 h-4 text-yellow-400" />
        <span className="font-bold text-white text-sm">{totalXP} XP</span>
      </motion.div>

      {/* XP Gain Popup */}
      <AnimatePresence>
        {showGain && (
          <motion.div
            className="absolute top-12 left-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            +{xpGain} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
