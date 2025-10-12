'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Sparkles, PlusCircle, Users } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function NewXPSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id')

  useEffect(() => {
    // Trigger confetti
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
      })
    }, 300)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            🎉 Geschafft!
          </h1>
          <p className="text-xl text-gray-600">
            Deine Experience wurde erfolgreich geteilt
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <StatsCard
            icon="✨"
            value="12"
            label="Ähnliche Experiences"
          />
          <StatsCard
            icon="🌍"
            value="47"
            label="In deiner Region"
          />
          <StatsCard
            icon="📈"
            value="+23%"
            label="Mehr als letztes Jahr"
          />
        </motion.div>

        {/* Witness Invitation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Möchtest du Zeugen einladen?
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Lade Personen ein, die dabei waren und ihre Version der Experience teilen können.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // TODO: Open witness modal
                  alert('Witness invitation coming soon!')
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                👥 Zeugen einladen
              </button>
              <button
                onClick={() => router.push(`/experiences/${experienceId}`)}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Später
              </button>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <button
            onClick={() => router.push(`/experiences/${experienceId}`)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
            <span>Zu meiner Experience</span>
          </button>

          <button
            onClick={() => router.push('/newxp')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Neue Experience teilen</span>
          </button>
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 mb-3">Teile deine Experience:</p>
          <div className="flex justify-center gap-3">
            <ShareButton platform="twitter" />
            <ShareButton platform="facebook" />
            <ShareButton platform="whatsapp" />
            <ShareButton platform="link" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ========================================
// STATS CARD
// ========================================

const StatsCard = ({
  icon,
  value,
  label,
}: {
  icon: string
  value: string
  label: string
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

// ========================================
// SHARE BUTTON
// ========================================

const ShareButton = ({ platform }: { platform: string }) => {
  const icons: Record<string, string> = {
    twitter: '𝕏',
    facebook: 'f',
    whatsapp: '💬',
    link: '🔗',
  }

  const colors: Record<string, string> = {
    twitter: 'bg-black hover:bg-gray-800',
    facebook: 'bg-blue-600 hover:bg-blue-700',
    whatsapp: 'bg-green-500 hover:bg-green-600',
    link: 'bg-gray-600 hover:bg-gray-700',
  }

  return (
    <button
      onClick={() => {
        // TODO: Implement sharing
        alert(`Share on ${platform}`)
      }}
      className={`w-12 h-12 rounded-full text-white font-bold transition-all ${colors[platform]}`}
    >
      {icons[platform]}
    </button>
  )
}
