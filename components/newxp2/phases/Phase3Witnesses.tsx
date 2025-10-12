'use client'

import { motion } from 'framer-motion'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { ArrowRight, ArrowLeft, UserPlus, SkipForward } from 'lucide-react'

export function Phase3Witnesses() {
  const { witnesses, nextPhase, previousPhase } = useNewXP2Store()

  const confirmedCount = witnesses.filter(w => w.status === 'confirmed').length

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-12 max-w-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Wer war dabei? 👥
        </h1>
        <p className="text-white/60 text-lg">
          Füge Zeugen hinzu um deine Experience zu bestätigen
        </p>
      </motion.div>

      {/* Witness Add Section */}
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center space-y-4">
          <UserPlus className="w-16 h-16 text-white/40 mx-auto" />
          <p className="text-white/60">
            Zeugen-Funktion kommt bald!
          </p>
          <p className="text-white/40 text-sm">
            Hier kannst du Personen suchen, per Email einladen oder einen Link generieren.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      {confirmedCount > 0 && (
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-white/60">
            <span className="font-bold text-green-400">{confirmedCount}</span> Zeuge(n) bestätigt
          </p>
        </motion.div>
      )}

      {/* Navigation */}
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
          onClick={nextPhase}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {confirmedCount > 0 ? 'Weiter' : 'Überspringen'}
          {confirmedCount > 0 ? <ArrowRight className="w-5 h-5" /> : <SkipForward className="w-5 h-5" />}
        </motion.button>
      </div>

      <motion.p
        className="mt-4 text-white/40 text-sm text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Optional: Zeugen stärken die Glaubwürdigkeit deiner Experience
      </motion.p>
    </div>
  )
}
