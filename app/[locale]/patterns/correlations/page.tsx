'use client';

import { useTranslations } from 'next-intl';
import { Zap, ArrowLeft, Activity, Moon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CorrelationsPage() {
  const t = useTranslations('patterns.correlations');

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
            <Zap className="w-10 h-10 text-observatory-gold" />
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
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 flex items-center justify-center">
              <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 flex items-center justify-center">
              <Moon className="w-10 h-10 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30 flex items-center justify-center">
              <Activity className="w-10 h-10 text-red-400 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white">
            {t('comingSoon')}
          </h2>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-yellow-300">
                  {t('solar.title')}
                </h3>
              </div>
              <p className="text-sm text-slate-300">
                {t('solar.desc')}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-blue-300">
                  {t('lunar.title')}
                </h3>
              </div>
              <p className="text-sm text-slate-300">
                {t('lunar.desc')}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-red-300">
                  {t('seismic.title')}
                </h3>
              </div>
              <p className="text-sm text-slate-300">
                {t('seismic.desc')}
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
