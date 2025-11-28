'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Users, TrendingUp, MessageCircle, Image, Sparkles } from 'lucide-react'
import { BentoCard, StatBentoCard } from './BentoCard'

interface BentoGridProps {
  children?: React.ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

export function BentoGrid({ children, className, columns = 3 }: BentoGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'grid gap-4',
        gridCols[columns],
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Pre-built Bento Grid for Experience Detail Page
interface ExperienceBentoGridProps {
  similarCount: number
  patternScore: number
  impactXP: number
  commentsCount: number
  mediaCount: number
  onSimilarClick?: () => void
  onPatternsClick?: () => void
  onImpactClick?: () => void
  onDiscussClick?: () => void
  onMediaClick?: () => void
}

export function ExperienceBentoGrid({
  similarCount,
  patternScore,
  impactXP,
  commentsCount,
  mediaCount,
  onSimilarClick,
  onPatternsClick,
  onImpactClick,
  onDiscussClick,
  onMediaClick,
}: ExperienceBentoGridProps) {
  return (
    <BentoGrid columns={2} className="lg:grid-cols-4">
      {/* Similar Experiences - Large */}
      <BentoCard
        title="Ähnliche Erfahrungen"
        subtitle="weltweit gefunden"
        icon={Users}
        iconColor="text-blue-400"
        gradient="bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20"
        onClick={onSimilarClick}
        size="lg"
        delay={0.1}
        className="lg:col-span-2"
      >
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-4xl md:text-5xl font-bold text-foreground">{similarCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Menschen teilen ähnliche Erlebnisse
            </p>
          </div>
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, similarCount))].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-background flex items-center justify-center text-xs font-medium"
              >
                {i + 1}
              </div>
            ))}
            {similarCount > 3 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{similarCount - 3}
              </div>
            )}
          </div>
        </div>
      </BentoCard>

      {/* Pattern Match */}
      <StatBentoCard
        title="Muster-Match"
        value={`${patternScore}%`}
        icon={TrendingUp}
        iconColor="text-emerald-400"
        onClick={onPatternsClick}
        delay={0.2}
      />

      {/* Impact XP */}
      <StatBentoCard
        title="Impact XP"
        value={`+${impactXP}`}
        icon={Sparkles}
        iconColor="text-amber-400"
        trend="up"
        trendValue="Contribution"
        onClick={onImpactClick}
        delay={0.3}
      />

      {/* Discussion */}
      <StatBentoCard
        title="Kommentare"
        value={commentsCount}
        icon={MessageCircle}
        iconColor="text-pink-400"
        onClick={onDiscussClick}
        delay={0.4}
      />

      {/* Media */}
      <StatBentoCard
        title="Medien"
        value={mediaCount}
        icon={Image}
        iconColor="text-cyan-400"
        onClick={onMediaClick}
        delay={0.5}
      />
    </BentoGrid>
  )
}

// Compact version for mobile or sidebar
interface CompactBentoGridProps {
  similarCount: number
  patternScore: number
  impactXP: number
  commentsCount: number
}

export function CompactBentoGrid({
  similarCount,
  patternScore,
  impactXP,
  commentsCount,
}: CompactBentoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-white/10">
        <Users className="h-5 w-5 text-blue-400" />
        <div>
          <p className="text-xl font-bold">{similarCount}</p>
          <p className="text-xs text-muted-foreground">ähnliche</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-white/10">
        <TrendingUp className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-xl font-bold">{patternScore}%</p>
          <p className="text-xs text-muted-foreground">Match</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-white/10">
        <Sparkles className="h-5 w-5 text-amber-400" />
        <div>
          <p className="text-xl font-bold">+{impactXP}</p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-white/10">
        <MessageCircle className="h-5 w-5 text-pink-400" />
        <div>
          <p className="text-xl font-bold">{commentsCount}</p>
          <p className="text-xs text-muted-foreground">Kommentare</p>
        </div>
      </div>
    </div>
  )
}
