'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'

export function Phase7PatternMatch() {
  const router = useRouter()
  const {
    isMatchingPatterns,
    patternMatches,
    insights,
    findPatterns,
  } = useNewXP2Store()

  useEffect(() => {
    // Trigger pattern matching on mount
    if (patternMatches.length === 0 && !isMatchingPatterns) {
      findPatterns()
    }
  }, [])

  const handleContinue = () => {
    router.push('/newxp2/success')
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {isMatchingPatterns ? (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Searching Animation */}
          <motion.div
            className="mb-8"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Searching the Cosmos...
          </h1>
          <p className="text-white/60 text-lg">
            Wir suchen nach ähnlichen Experiences
          </p>

          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mt-8" />
        </motion.div>
      ) : (
        <motion.div
          className="text-center max-w-2xl w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Du bist nicht allein! 🌌
            </h1>
            <p className="text-white/60 text-lg">
              {patternMatches.length > 0
                ? `Wir haben ${patternMatches.length} ähnliche Experience(s) gefunden`
                : 'Keine ähnlichen Experiences gefunden'}
            </p>
          </motion.div>

          {/* Insights */}
          {insights.length > 0 && (
            <motion.div
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-white font-bold mb-4">✨ Pattern Insights</h3>
              <ul className="text-white/80 text-left space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Matches Preview */}
          {patternMatches.length > 0 && (
            <motion.div
              className="grid gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {patternMatches.slice(0, 3).map((match, i) => (
                <motion.div
                  key={match.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{match.title}</h4>
                    <span className="text-green-400 text-sm font-bold">
                      {Math.round(match.similarity * 100)}% Match
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {match.location && `📍 ${match.location}`}
                    {match.location && match.date && ' • '}
                    {match.date && `📅 ${match.date}`}
                  </p>
                </motion.div>
              ))}

              {patternMatches.length > 3 && (
                <p className="text-white/40 text-sm">
                  +{patternMatches.length - 3} weitere Matches
                </p>
              )}
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.button
            onClick={handleContinue}
            className="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Fertig! 🎉
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
