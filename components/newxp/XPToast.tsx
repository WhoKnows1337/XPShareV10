'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Sparkles } from 'lucide-react'

export const XPToast = () => {
  const { showXPToast, xpEarned } = useNewXPStore()

  return (
    <AnimatePresence>
      {showXPToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-2xl flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">+{xpEarned} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
