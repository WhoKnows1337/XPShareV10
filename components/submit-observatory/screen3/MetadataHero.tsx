'use client';

import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface MetadataHeroProps {
  title: string;
  summary: string;
  category: string;
  tagCount: number;
  qualityScore?: {
    title: number;
    summary: number;
    tags: number;
  };
}

export function MetadataHero({ title, summary, category, tagCount, qualityScore }: MetadataHeroProps) {

  const averageQuality = qualityScore
    ? Math.round((qualityScore.title + qualityScore.summary + qualityScore.tags) / 3)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-accent-cyan/20 p-6 backdrop-blur-xl border border-glass-border"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(72,187,120,0.2),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with AI Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Sparkles className="w-5 h-5 text-accent-cyan" />
            </motion.div>
            <h2 className="text-lg font-semibold text-text-primary">
              KI hat deine Experience vervollständigt
            </h2>
          </div>

          {/* Quality Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass-bg/50 backdrop-blur-sm border border-glass-border"
          >
            {averageQuality >= 80 ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
            )}
            <span className="text-xs font-medium text-text-primary">
              {averageQuality}% Qualität
            </span>
          </motion.div>
        </div>

        {/* Generated Metadata Preview */}
        <div className="space-y-3">
          {/* Title Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-xs text-text-tertiary mb-1 flex items-center gap-1.5">
              <span>Titel</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan">
                AI
              </span>
            </div>
            <p className="text-base font-semibold text-text-primary leading-snug">
              {title || 'Kein Titel generiert'}
            </p>
          </motion.div>

          {/* Summary Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-xs text-text-tertiary mb-1 flex items-center gap-1.5">
              <span>Zusammenfassung</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple">
                AI
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {summary || 'Keine Zusammenfassung generiert'}
            </p>
          </motion.div>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4 pt-2 text-xs text-text-tertiary"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-blue" />
              <span>{category}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span>
                {tagCount} Tags
              </span>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 pt-4 border-t border-glass-border/50"
        >
          <p className="text-xs text-text-tertiary">
            💡 Alles editierbar in der Sidebar rechts
          </p>
        </motion.div>
      </div>

      {/* Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-r from-accent-cyan/10 via-accent-purple/10 to-accent-blue/10 blur-xl"
      />
    </motion.div>
  );
}
