'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { Trophy, Sparkles } from 'lucide-react'
import { getLevelTitle } from '@/lib/utils/xp-calculator'

interface LevelUpAnimationProps {
  show: boolean
  newLevel: number
  onComplete: () => void
}

export function LevelUpAnimation({ show, newLevel, onComplete }: LevelUpAnimationProps) {
  const [stage, setStage] = useState(0)
  const levelTitle = getLevelTitle(newLevel)

  useEffect(() => {
    if (show) {
      setStage(0)
      
      // Stage 1: Show animation
      const timer1 = setTimeout(() => setStage(1), 100)
      
      // Stage 2: Confetti
      const timer2 = setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#8b5cf6', '#6366f1', '#06b6d4', '#10b981']
        })
        setStage(2)
      }, 800)
      
      // Stage 3: Complete
      const timer3 = setTimeout(() => {
        setStage(3)
        onComplete()
      }, 3000)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative max-w-md w-full mx-4"
          >
            <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-8 rounded-2xl shadow-2xl">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="inline-block"
                >
                  <Trophy className="w-20 h-20 text-yellow-300" />
                </motion.div>
                
                <div className="space-y-2">
                  <motion.h2
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-4xl font-bold text-white"
                  >
                    LEVEL UP!
                  </motion.h2>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-1"
                  >
                    <p className="text-6xl font-bold text-white">
                      {newLevel}
                    </p>
                    <p className="text-xl text-white/90 flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {levelTitle}
                      <Sparkles className="w-5 h-5" />
                    </p>
                  </motion.div>
                </div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-white/80 text-sm"
                >
                  Keep sharing your experiences to unlock more rewards!
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
