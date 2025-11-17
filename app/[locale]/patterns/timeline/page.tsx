'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TimelinePage() {
  const t = useTranslations('patterns.timeline');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-observatory-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-observatory-gold/20 border border-observatory-gold/30 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-observatory-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-12 text-center space-y-6"
        >
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-observatory-gold/20 to-observatory-accent/20 border-2 border-observatory-gold/30 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-observatory-gold animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-white">
            {t('comingSoon')}
          </h2>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h3 className="font-semibold text-observatory-gold mb-2">
                {t('feature1Title')}
              </h3>
              <p className="text-sm text-slate-400">
                {t('feature1Desc')}
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h3 className="font-semibold text-observatory-gold mb-2">
                {t('feature2Title')}
              </h3>
              <p className="text-sm text-slate-400">
                {t('feature2Desc')}
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h3 className="font-semibold text-observatory-gold mb-2">
                {t('feature3Title')}
              </h3>
              <p className="text-sm text-slate-400">
                {t('feature3Desc')}
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/"
              className="btn-observatory inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('returnHome')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
