import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  illustration?: 'default' | 'search' | 'create' | 'connect'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  illustration = 'default'
}: EmptyStateProps) {
  const illustrationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.4
      }
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        {/* Animated Icon Illustration */}
        <motion.div
          variants={illustrationVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="relative">
            {/* Background Circle */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />

            {/* Icon Container */}
            <div className="relative bg-primary/10 rounded-full p-6">
              <Icon className="h-16 w-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-md space-y-3"
        >
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Optional Action Button */}
          {(actionLabel && (actionHref || onAction)) && (
            <div className="pt-4">
              {actionHref ? (
                <Link href={actionHref}>
                  <Button size="lg" className="min-w-[200px]">
                    {actionLabel}
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="min-w-[200px]" onClick={onAction}>
                  {actionLabel}
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      </CardContent>
    </Card>
  )
}
