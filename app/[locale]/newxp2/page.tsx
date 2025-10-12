'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { CosmicBackground } from '@/components/newxp2/canvas/CosmicBackground'
import { Phase1Entry } from '@/components/newxp2/phases/Phase1Entry'
import { Phase2LiveExtraction } from '@/components/newxp2/phases/Phase2LiveExtraction'
import { Phase3Witnesses } from '@/components/newxp2/phases/Phase3Witnesses'
import { Phase4Media } from '@/components/newxp2/phases/Phase4Media'
import { Phase5CanvasPreview } from '@/components/newxp2/phases/Phase5CanvasPreview'
import { Phase6Privacy } from '@/components/newxp2/phases/Phase6Privacy'
import { Phase7PatternMatch } from '@/components/newxp2/phases/Phase7PatternMatch'
import { ConfettiEffect } from '@/components/newxp2/effects/ConfettiEffect'
import { AchievementPopup } from '@/components/newxp2/ui/AchievementPopup'
import { XPBadge } from '@/components/newxp2/ui/XPBadge'
import { AnimatePresence, motion } from 'framer-motion'

export default function NewXP2Page() {
  const router = useRouter()
  const {
    currentPhase,
    publishedId,
    cosmicAnimationEnabled,
    showAchievement,
    totalXP,
    confettiActive,
  } = useNewXP2Store()

  // Redirect to success page after publish
  useEffect(() => {
    if (publishedId && currentPhase === 7) {
      // Stay on pattern matching page
      // Success redirect happens after pattern matching
    }
  }, [publishedId, currentPhase])

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Cosmic Background */}
      {cosmicAnimationEnabled && <CosmicBackground />}

      {/* Main Content - Phase Router */}
      <div className="relative z-10 w-full min-h-screen">
        <AnimatePresence mode="wait">
          {currentPhase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Phase1Entry />
            </motion.div>
          )}

          {currentPhase === 2 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Phase2LiveExtraction />
            </motion.div>
          )}

          {currentPhase === 3 && (
            <motion.div
              key="phase3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Phase3Witnesses />
            </motion.div>
          )}

          {currentPhase === 4 && (
            <motion.div
              key="phase4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Phase4Media />
            </motion.div>
          )}

          {currentPhase === 5 && (
            <motion.div
              key="phase5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Phase5CanvasPreview />
            </motion.div>
          )}

          {currentPhase === 6 && (
            <motion.div
              key="phase6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Phase6Privacy />
            </motion.div>
          )}

          {currentPhase === 7 && (
            <motion.div
              key="phase7"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.7 }}
            >
              <Phase7PatternMatch />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global UI Overlays */}
      <XPBadge totalXP={totalXP} />

      {/* Confetti Effect */}
      {confettiActive && <ConfettiEffect />}

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && <AchievementPopup achievement={showAchievement} />}
      </AnimatePresence>

      {/* Phase Indicator (top right) */}
      <PhaseIndicator currentPhase={currentPhase} />
    </div>
  )
}

// ========================================
// PHASE INDICATOR
// ========================================

function PhaseIndicator({ currentPhase }: { currentPhase: number }) {
  const phases = [
    { num: 1, label: 'Eingabe', icon: '✍️' },
    { num: 2, label: 'Erkennung', icon: '✨' },
    { num: 3, label: 'Zeugen', icon: '👥' },
    { num: 4, label: 'Medien', icon: '📸' },
    { num: 5, label: 'Vorschau', icon: '👁️' },
    { num: 6, label: 'Privatsphäre', icon: '🔒' },
    { num: 7, label: 'Muster', icon: '🌌' },
  ]

  return (
    <div className="fixed top-6 right-6 z-50 hidden md:block">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2">
        {phases.map((phase, index) => (
          <div key={phase.num} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                currentPhase === phase.num
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110'
                  : currentPhase > phase.num
                  ? 'bg-green-500/50 text-white'
                  : 'bg-white/10 text-white/50'
              }`}
              whileHover={{ scale: 1.1 }}
              title={phase.label}
            >
              <span>{phase.icon}</span>
            </motion.div>
            {index < phases.length - 1 && (
              <div
                className={`w-6 h-0.5 transition-colors ${
                  currentPhase > phase.num ? 'bg-green-500/50' : 'bg-white/20'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
