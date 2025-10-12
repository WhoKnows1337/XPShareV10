'use client'

import { motion } from 'framer-motion'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { ArrowRight, ArrowLeft, MapPin, Calendar, Tag } from 'lucide-react'

export function Phase5CanvasPreview() {
  const {
    rawText,
    extractedData,
    mediaFiles,
    witnesses,
    completionScore,
    missingSuggestions,
    nextPhase,
    previousPhase,
  } = useNewXP2Store()

  const confirmedWitnesses = witnesses.filter(w => w.status === 'confirmed')

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8 max-w-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Deine Story nimmt Gestalt an 👁️
        </h1>
        <p className="text-white/60 text-lg">
          So wird deine Experience aussehen
        </p>
      </motion.div>

      {/* Progress Ring */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${(completionScore / 100) * 352} 352` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{completionScore}%</span>
          </div>
        </div>
      </motion.div>

      {/* Preview Card */}
      <motion.div
        className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Hero Image */}
        {mediaFiles.length > 0 && mediaFiles[0].type === 'photo' && (
          <div className="w-full h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <img
              src={mediaFiles[0].preview}
              alt=""
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {extractedData.title || 'Deine Experience'}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-white/60">
            {extractedData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {extractedData.location}
              </div>
            )}
            {extractedData.date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {extractedData.date}
              </div>
            )}
            {extractedData.category && (
              <div className="px-3 py-1 bg-blue-500/30 rounded-full">
                {extractedData.category}
              </div>
            )}
          </div>

          {/* Text */}
          <p className="text-white/80 leading-relaxed line-clamp-4 mb-6">
            {rawText}
          </p>

          {/* Tags */}
          {extractedData.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <Tag className="w-4 h-4 text-white/40" />
              {extractedData.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Witnesses */}
          {confirmedWitnesses.length > 0 && (
            <div className="text-white/60 text-sm">
              👥 {confirmedWitnesses.length} Zeuge(n)
            </div>
          )}
        </div>
      </motion.div>

      {/* Missing Suggestions */}
      {missingSuggestions.length > 0 && (
        <motion.div
          className="w-full max-w-2xl bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-yellow-200 text-sm font-medium mb-2">💡 Vervollständige deine Experience:</p>
          <ul className="text-yellow-100/80 text-sm space-y-1">
            {missingSuggestions.map((suggestion, i) => (
              <li key={i}>• {suggestion}</li>
            ))}
          </ul>
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
          Sieht gut aus!
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
