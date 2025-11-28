'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { similarCardVariants } from '../shared/animations'

interface SimilarCardProps {
  id: string
  title: string
  category: string
  matchScore?: number
  user?: {
    username: string
    display_name?: string
    avatar_url?: string
  }
  className?: string
  index?: number
}

const categoryIcons: Record<string, string> = {
  ufo: '🛸',
  paranormal: '👻',
  dreams: '💭',
  psychedelic: '🌈',
  spiritual: '✨',
  synchronicity: '🔄',
  nde: '💫',
  other: '❓',
}

export function SimilarCard({
  id,
  title,
  category,
  matchScore,
  user,
  className,
  index = 0,
}: SimilarCardProps) {
  const icon = categoryIcons[category] || categoryIcons.other

  return (
    <motion.div
      variants={similarCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/experiences/${id}`}
        className={cn(
          'block p-4 rounded-xl',
          'bg-card/50 backdrop-blur-sm',
          'border border-white/10 hover:border-primary/30',
          'transition-all duration-200',
          'group',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          {matchScore && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {matchScore}% Match
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Author */}
        {user && (
          <div className="flex items-center gap-2">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.display_name || user.username}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-space-light flex items-center justify-center text-[10px]">
                {(user.display_name || user.username).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              @{user.username}
            </span>
          </div>
        )}

        {/* Match Progress */}
        {matchScore && (
          <div className="mt-3">
            <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/50"
                initial={{ width: 0 }}
                animate={{ width: `${matchScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
              />
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

/**
 * Compact horizontal card for mobile scroll
 */
export function SimilarCardCompact({
  id,
  title,
  category,
  matchScore,
  user,
  className,
}: SimilarCardProps) {
  const icon = categoryIcons[category] || categoryIcons.other

  return (
    <Link
      href={`/experiences/${id}`}
      className={cn(
        'flex-shrink-0 w-48 p-3 rounded-xl',
        'bg-card/50 backdrop-blur-sm',
        'border border-white/10 hover:border-primary/30',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        {matchScore && (
          <span className="text-[10px] font-medium text-primary">
            {matchScore}%
          </span>
        )}
      </div>

      <h4 className="text-sm font-medium line-clamp-2 mb-1">{title}</h4>

      {user && (
        <p className="text-xs text-muted-foreground truncate">
          @{user.username}
        </p>
      )}
    </Link>
  )
}

export default SimilarCard
