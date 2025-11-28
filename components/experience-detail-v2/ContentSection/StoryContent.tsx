'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { storyRevealVariants } from '../shared/animations'

interface StoryContentProps {
  text: string
  /** Max characters before truncation */
  maxLength?: number
  className?: string
  /** Enable reveal animation */
  animate?: boolean
}

export function StoryContent({
  text,
  maxLength = 500,
  className,
  animate = true,
}: StoryContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const needsTruncation = text.length > maxLength
  const displayText = isExpanded || !needsTruncation
    ? text
    : text.slice(0, maxLength).trim() + '...'

  const handleToggle = () => {
    setIsExpanded(!isExpanded)

    // Scroll to content if collapsing
    if (isExpanded && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      if (rect.top < 0) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const content = (
    <div ref={contentRef} className={cn('relative', className)}>
      {/* Story Text */}
      <motion.div
        layout
        className={cn(
          'prose prose-invert prose-sm max-w-none',
          'prose-p:text-foreground prose-p:leading-relaxed',
          'prose-p:mb-4 last:prose-p:mb-0'
        )}
      >
        {displayText.split('\n\n').map((paragraph, index) => (
          <motion.p
            key={index}
            initial={animate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-base leading-7"
          >
            {paragraph}
          </motion.p>
        ))}
      </motion.div>

      {/* Gradient Fade (when truncated) */}
      <AnimatePresence>
        {needsTruncation && !isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Expand/Collapse Button */}
      {needsTruncation && (
        <motion.button
          onClick={handleToggle}
          className={cn(
            'flex items-center gap-1.5 mt-4 text-sm font-medium',
            'text-primary hover:text-primary/80 transition-colors'
          )}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Weniger anzeigen
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Weiterlesen
            </>
          )}
        </motion.button>
      )}
    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      variants={storyRevealVariants}
      initial="hidden"
      animate="visible"
    >
      {content}
    </motion.div>
  )
}

/**
 * Dynamic Q&A display for experience answers
 */
interface DynamicAnswer {
  question_id: string
  question_text: string
  answer_type: 'text' | 'chips' | 'slider'
  answer_value: string | number | string[]
  options?: string[]
}

export function DynamicQA({
  answers,
  className,
}: {
  answers: DynamicAnswer[]
  className?: string
}) {
  if (!answers || answers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('space-y-4', className)}
    >
      {answers.map((answer, index) => (
        <motion.div
          key={answer.question_id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className={cn(
            'p-4 rounded-xl',
            'bg-card/30 border border-white/5'
          )}
        >
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">❓</span>
            {answer.question_text}
          </p>
          <div className="text-foreground">
            {answer.answer_type === 'chips' && Array.isArray(answer.answer_value) ? (
              <div className="flex flex-wrap gap-2">
                {answer.answer_value.map((chip, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : answer.answer_type === 'slider' ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-space-light rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${Number(answer.answer_value)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-sm font-medium">{answer.answer_value}%</span>
              </div>
            ) : (
              <p className="text-base leading-relaxed">
                "{String(answer.answer_value)}"
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default StoryContent
