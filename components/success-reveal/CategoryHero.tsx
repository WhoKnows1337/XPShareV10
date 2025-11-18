'use client'

import { motion } from 'framer-motion'
import { getCategoryTheme } from '@/lib/config/category-themes'
import { getCategoryLabel } from '@/lib/constants/categories'

interface CategoryHeroProps {
  category: string
  title?: string
  subtitle?: string
}

export function CategoryHero({ category, title, subtitle }: CategoryHeroProps) {
  const theme = getCategoryTheme(category)
  const categoryLabel = getCategoryLabel(category)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} p-12 text-center backdrop-blur-sm border ${theme.borderColor}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Large Emoji Hero */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-6 text-8xl"
        >
          {theme.heroEmoji}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-3 text-4xl font-bold text-white"
        >
          {title || `Your ${categoryLabel} is now live`}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-white/80"
        >
          {subtitle || 'Documented • Analyzed • Connected'}
        </motion.p>

        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
        >
          <span className="text-2xl">{theme.heroEmoji}</span>
          <span className={`font-medium ${theme.accentColor}`}>{categoryLabel}</span>
        </motion.div>
      </div>

      {/* Animated Glow Effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute inset-0 rounded-2xl ${theme.glowColor} blur-3xl -z-10`}
      />
    </motion.div>
  )
}
