'use client'

import { motion } from 'framer-motion'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function Phase6Privacy() {
  const { privacyLevel, setPrivacy, publish, isPublishing, previousPhase } = useNewXP2Store()
  const [countdown, setCountdown] = useState<number | null>(null)

  const privacyOptions = [
    {
      level: 'public' as const,
      icon: '🌍',
      label: 'Öffentlich',
      description: 'Erreiche die Community',
      xp: 50,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      level: 'anonymous' as const,
      icon: '🎭',
      label: 'Anonym',
      description: 'Verifiziert, ohne Namen',
      xp: 30,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      level: 'private' as const,
      icon: '🔒',
      label: 'Privat',
      description: 'Nur für dich',
      xp: 10,
      gradient: 'from-gray-500 to-gray-700',
    },
  ]

  const selected = privacyOptions.find(o => o.level === privacyLevel) || privacyOptions[1]

  const handlePublish = () => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer)
          publish()
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-12 max-w-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Wer soll das sehen? 🔒
        </h1>
        <p className="text-white/60 text-lg">
          Wähle deine Privatsphäre-Einstellung
        </p>
      </motion.div>

      {/* Privacy Options */}
      <div className="w-full max-w-md space-y-4 mb-12">
        {privacyOptions.map((option, index) => (
          <motion.button
            key={option.level}
            onClick={() => setPrivacy(option.level)}
            className={`w-full p-6 rounded-2xl border-2 transition-all ${
              privacyLevel === option.level
                ? `bg-gradient-to-r ${option.gradient} border-white/50 shadow-2xl scale-105`
                : 'bg-white/5 border-white/20 hover:border-white/40'
            }`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: privacyLevel === option.level ? 1.05 : 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{option.icon}</span>
                <div className="text-left">
                  <h3 className="text-white font-bold text-lg">{option.label}</h3>
                  <p className="text-white/60 text-sm">{option.description}</p>
                </div>
              </div>

              {/* XP Badge */}
              <motion.div
                className="flex items-center gap-2 px-3 py-1 bg-yellow-500/30 rounded-full"
                whileHover={{ scale: 1.1 }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-yellow-300 font-bold text-sm">+{option.xp} XP</span>
              </motion.div>
            </div>

            {/* Radio Indicator */}
            <div className="mt-4 flex justify-end">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                privacyLevel === option.level
                  ? 'border-white bg-white'
                  : 'border-white/40'
              }`}>
                {privacyLevel === option.level && (
                  <motion.div
                    className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Publish Button / Countdown */}
      {countdown !== null ? (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-6xl font-bold"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 0 0 rgba(99, 102, 241, 0.7)',
                '0 0 0 40px rgba(99, 102, 241, 0)',
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            {countdown}
          </motion.div>
          <p className="text-white/60">Veröffentliche in...</p>
        </motion.div>
      ) : (
        <div className="flex items-center gap-4">
          <motion.button
            onClick={previousPhase}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </motion.button>

          <motion.button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`px-12 py-5 bg-gradient-to-r ${selected.gradient} text-white rounded-full font-bold text-xl shadow-2xl transition-shadow ${
              isPublishing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-3xl'
            }`}
            whileHover={!isPublishing ? { scale: 1.05 } : {}}
            whileTap={!isPublishing ? { scale: 0.95 } : {}}
          >
            {isPublishing ? 'Veröffentliche...' : 'Jetzt veröffentlichen! 🚀'}
          </motion.button>
        </div>
      )}
    </div>
  )
}
