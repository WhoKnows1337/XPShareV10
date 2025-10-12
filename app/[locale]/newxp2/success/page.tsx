'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { Home, Eye, Share2 } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function SuccessPage() {
  const router = useRouter()
  const { publishedId, totalXP, reset } = useNewXP2Store()

  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
    })
  }, [])

  const handleViewExperience = () => {
    if (publishedId) {
      router.push(`/experiences/${publishedId}`)
    }
  }

  const handleNewExperience = () => {
    reset()
    router.push('/newxp2')
  }

  const handleHome = () => {
    router.push('/feed')
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      {/* Success Animation */}
      <motion.div
        className="mb-12"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl">
          <motion.span
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            🎉
          </motion.span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        className="text-center mb-8 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Veröffentlicht! 🚀
        </h1>
        <p className="text-white/60 text-xl">
          Deine Experience ist jetzt Teil der Community
        </p>
      </motion.div>

      {/* XP Earned */}
      <motion.div
        className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-8 mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-yellow-200 text-sm uppercase tracking-wide mb-2">Gesamt verdient</p>
        <p className="text-yellow-300 text-4xl font-bold">+{totalXP} XP</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {publishedId && (
          <button
            onClick={handleViewExperience}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors border border-white/20"
          >
            <Eye className="w-5 h-5" />
            Ansehen
          </button>
        )}

        <button
          onClick={handleNewExperience}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow"
        >
          <Share2 className="w-5 h-5" />
          Neue Experience
        </button>

        <button
          onClick={handleHome}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors border border-white/20"
        >
          <Home className="w-5 h-5" />
          Zur Startseite
        </button>
      </motion.div>

      {/* Fun Fact */}
      <motion.p
        className="mt-12 text-white/40 text-sm text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        ✨ Deine Experience kann jetzt von anderen entdeckt werden und zu neuen Verbindungen führen
      </motion.p>
    </div>
  )
}
