'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';

export type InsightSeverity = 'high' | 'medium' | 'low' | 'info';
export type InsightType = 'wave-detection' | 'correlation' | 'temporal' | 'attribute' | 'similar';

interface InsightCardProps {
  type: InsightType;
  severity: InsightSeverity;
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'stable';
  };
  visual?: ReactNode;
  cta?: {
    label: string;
    onClick: () => void;
  };
  delay?: number;
}

const severityColors = {
  high: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    glow: 'shadow-red-500/20',
    text: 'text-red-400',
    icon: 'bg-red-500/20 text-red-400',
  },
  medium: {
    border: 'border-observatory-gold/40',
    bg: 'bg-observatory-gold/5',
    glow: 'shadow-observatory-gold/20',
    text: 'text-observatory-gold',
    icon: 'bg-observatory-gold/20 text-observatory-gold',
  },
  low: {
    border: 'border-observatory-accent/40',
    bg: 'bg-observatory-accent/5',
    glow: 'shadow-observatory-accent/20',
    text: 'text-observatory-accent',
    icon: 'bg-observatory-accent/20 text-observatory-accent',
  },
  info: {
    border: 'border-slate-700/40',
    bg: 'bg-slate-800/50',
    glow: 'shadow-slate-700/20',
    text: 'text-slate-300',
    icon: 'bg-slate-700/20 text-slate-400',
  },
};

export function InsightCard({
  type,
  severity,
  icon: Icon,
  title,
  description,
  metric,
  visual,
  cta,
  delay = 0,
}: InsightCardProps) {
  const colors = severityColors[severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-6 rounded-xl border-2 transition-all
        ${colors.border} ${colors.bg}
        hover:shadow-xl ${colors.glow}
      `}
    >
      {/* Pulse animation for high severity */}
      {severity === 'high' && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              '0 0 0px rgba(239, 68, 68, 0.3)',
              '0 0 25px rgba(239, 68, 68, 0.6)',
              '0 0 0px rgba(239, 68, 68, 0.3)',
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${colors.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${colors.text} mb-1`}>
                {title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Metric */}
          {metric && (
            <div className="flex flex-col items-end ml-4">
              <div className="flex items-center gap-1">
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {metric.value}
                </span>
                {metric.trend === 'up' && (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                )}
              </div>
              <span className="text-xs text-slate-500">{metric.label}</span>
            </div>
          )}
        </div>

        {/* Visual Preview */}
        {visual && (
          <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            {visual}
          </div>
        )}

        {/* CTA */}
        {cta && (
          <motion.button
            onClick={cta.onClick}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full mt-4 px-4 py-2.5 rounded-lg
              bg-gradient-to-r ${
                severity === 'high'
                  ? 'from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30'
                  : 'from-observatory-gold/20 to-observatory-accent/20 hover:from-observatory-gold/30 hover:to-observatory-accent/30'
              }
              border ${colors.border}
              flex items-center justify-center gap-2
              text-sm font-medium ${colors.text}
              transition-all
            `}
          >
            {cta.label}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
