'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MoreHorizontal, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useStickyHeader } from '../shared/useParallax'
import { CategoryBadge } from './CategoryPill'

interface FloatingHeaderProps {
  title: string
  category: string
  experienceId: string
  isAuthor?: boolean
  className?: string
}

export function FloatingHeader({
  title,
  category,
  experienceId,
  isAuthor = false,
  className,
}: FloatingHeaderProps) {
  const router = useRouter()
  const { isVisible, isAtTop, headerStyle, variants } = useStickyHeader({
    threshold: 100,
    hideOnScrollDown: true,
  })

  const handleBack = () => {
    // Try to go back, fallback to feed
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/feed')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  return (
    <AnimatePresence>
      <motion.header
        variants={variants}
        initial="visible"
        animate={isVisible ? 'visible' : 'hidden'}
        transition={{ duration: 0.2 }}
        style={headerStyle}
        className={cn(
          'px-4 py-3',
          'transition-all duration-300',
          isAtTop
            ? 'bg-transparent'
            : 'bg-space-deep/80 backdrop-blur-xl border-b border-white/5',
          className
        )}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          </motion.div>

          {/* Center: Category + Title (visible when scrolled) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: isAtTop ? 0 : 1,
              y: isAtTop ? -10 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex items-center justify-center gap-3 min-w-0"
          >
            <CategoryBadge category={category} className="flex-shrink-0" />
            <span className="text-sm font-medium truncate max-w-[200px] md:max-w-[400px]">
              {title}
            </span>
          </motion.div>

          {/* Right: Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.href)
                  }
                >
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAuthor ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push(`/experiences/${experienceId}/edit`)}
                    >
                      Edit experience
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete experience
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>Report experience</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </motion.header>
    </AnimatePresence>
  )
}

export default FloatingHeader
