'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { SimilarExperiences } from './SimilarExperiences'
import { WorldMap } from './WorldMap'
import { StatsCounter } from './StatsCounter'
import { CheckCircle2, Sparkles, PlusCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 },
  },
}

export const Discovery = () => {
  const { experienceId, similarExperiences, mapData, stats } = useSubmitStore()
  const router = useRouter()

  // Trigger confetti on mount
  useEffect(() => {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
      })
    }, 500)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Success Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🎉 Deine Erfahrung wurde geteilt!
          </h1>
          <p className="text-xl text-gray-600">
            Wir haben ähnliche Erfahrungen für dich gefunden
          </p>
        </motion.div>

        {/* Stats Counter */}
        <motion.div variants={itemVariants} className="mb-12">
          <StatsCounter stats={stats} />
        </motion.div>

        {/* Similar Experiences */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Ähnliche Erfahrungen gefunden:
            </h2>
          </div>
          <SimilarExperiences experiences={similarExperiences} />
        </motion.div>

        {/* World Map */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🌍 Auf der Weltkarte
          </h2>
          <WorldMap mapData={mapData} />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/experiences/${experienceId}`)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
            <span>Zu meiner Erfahrung</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/submit')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-xl transition-all shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Neue Erfahrung</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <User className="w-5 h-5" />
            <span>Profil</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
