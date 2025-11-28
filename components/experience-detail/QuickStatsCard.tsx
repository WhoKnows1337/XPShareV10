'use client'

import { motion } from 'framer-motion'
import { Eye, Heart, MessageCircle, Users, TrendingUp, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface QuickStatsCardProps {
  viewCount: number
  likeCount: number
  commentCount: number
  similarCount: number
  shareCount?: number
  onLikeClick?: () => void
  onShareClick?: () => void
  isLiked?: boolean
  className?: string
}

export function QuickStatsCard({
  viewCount,
  likeCount,
  commentCount,
  similarCount,
  shareCount,
  onLikeClick,
  onShareClick,
  isLiked = false,
  className,
}: QuickStatsCardProps) {
  const stats = [
    {
      icon: Eye,
      value: viewCount,
      label: 'Views',
      color: 'text-slate-400',
    },
    {
      icon: Heart,
      value: likeCount,
      label: 'Likes',
      color: isLiked ? 'text-pink-500' : 'text-slate-400',
      onClick: onLikeClick,
      filled: isLiked,
    },
    {
      icon: MessageCircle,
      value: commentCount,
      label: 'Kommentare',
      color: 'text-blue-400',
    },
    {
      icon: Users,
      value: similarCount,
      label: 'Ähnliche',
      color: 'text-emerald-400',
    },
  ]

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'p-4 rounded-2xl bg-card/50 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Statistiken</h3>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg bg-white/5',
              stat.onClick && 'cursor-pointer hover:bg-white/10 transition-colors'
            )}
            onClick={stat.onClick}
          >
            <stat.icon
              className={cn(
                'h-4 w-4',
                stat.color,
                stat.filled && 'fill-current'
              )}
            />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">
                {formatNumber(stat.value)}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Share Button */}
      {onShareClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onShareClick}
          className="w-full mt-3 gap-2"
        >
          <Share2 className="h-4 w-4" />
          Teilen
          {shareCount !== undefined && shareCount > 0 && (
            <span className="text-muted-foreground">({shareCount})</span>
          )}
        </Button>
      )}
    </motion.div>
  )
}

// Inline version for mobile headers
interface InlineStatsProps {
  viewCount: number
  likeCount: number
  commentCount: number
  isLiked?: boolean
  onLikeClick?: () => void
  className?: string
}

export function InlineStats({
  viewCount,
  likeCount,
  commentCount,
  isLiked = false,
  onLikeClick,
  className,
}: InlineStatsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Eye className="h-4 w-4" />
        {formatNumber(viewCount)}
      </span>
      <button
        onClick={onLikeClick}
        className={cn(
          'flex items-center gap-1 transition-colors',
          isLiked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'
        )}
      >
        <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
        {formatNumber(likeCount)}
      </button>
      <span className="flex items-center gap-1 text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        {formatNumber(commentCount)}
      </span>
    </div>
  )
}
