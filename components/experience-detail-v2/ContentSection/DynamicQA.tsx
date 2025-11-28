'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeInUp, staggerContainer } from '../shared/animations'

interface DynamicAnswer {
  question_id: string
  question_text: string
  answer_type: 'text' | 'chips' | 'slider'
  answer_value: string | number | string[]
  options?: string[]
}

interface DynamicQAProps {
  answers: DynamicAnswer[]
  className?: string
}

/**
 * DynamicQA Component
 *
 * Displays dynamic question/answer pairs in a visually appealing card layout.
 * Supports different answer types: text, chips (multiple choice), and slider.
 */
export function DynamicQA({ answers, className }: DynamicQAProps) {
  if (!answers || answers.length === 0) {
    return null
  }

  return (
    <motion.div
      className={cn('space-y-4', className)}
      variants={staggerContainer(0.08, 0)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {answers.map((answer, index) => (
        <motion.div
          key={answer.question_id || index}
          variants={fadeInUp}
          className="rounded-xl bg-card/30 border border-white/5 p-4 backdrop-blur-sm"
        >
          {/* Question */}
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {answer.question_text}
          </p>

          {/* Answer */}
          <div className="mt-1">
            {answer.answer_type === 'chips' && Array.isArray(answer.answer_value) ? (
              <div className="flex flex-wrap gap-2">
                {answer.answer_value.map((chip, chipIndex) => (
                  <span
                    key={chipIndex}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : answer.answer_type === 'slider' && typeof answer.answer_value === 'number' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Intensity</span>
                  <span className="font-semibold text-foreground">{answer.answer_value}/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(answer.answer_value / 10) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-foreground font-medium">
                {String(answer.answer_value)}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default DynamicQA
