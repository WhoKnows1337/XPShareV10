'use client'

import { motion } from 'framer-motion'
import {
  Bell,
  Users,
  BarChart3,
  Microscope,
  Camera,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { getCategoryTheme } from '@/lib/config/category-themes'

interface SmartAction {
  icon: React.ElementType
  title: string
  description: string
  href?: string
  onClick?: () => void
  badge?: string
  color: string
  priority: 'primary' | 'secondary'
}

interface SmartNextStepsProps {
  category: string
  experienceId: string
  hasLocation: boolean
  hasMedia: boolean
  nearbyUsersCount?: number
}

export function SmartNextSteps({
  category,
  experienceId,
  hasLocation,
  hasMedia,
  nearbyUsersCount = 0,
}: SmartNextStepsProps) {
  const theme = getCategoryTheme(category)

  // Build smart actions based on context
  const actions: SmartAction[] = []

  // Always suggest notifications
  actions.push({
    icon: Bell,
    title: 'Follow-up aktivieren',
    description: 'Bleib informiert über ähnliche Ereignisse',
    onClick: () => {
      // Scroll to notifications section
      document.getElementById('follow-up-actions')?.scrollIntoView({ behavior: 'smooth' })
    },
    color: 'blue',
    priority: 'primary',
  })

  // Suggest community if there are nearby users
  if (nearbyUsersCount > 0) {
    actions.push({
      icon: Users,
      title: 'Community beitreten',
      description: `${nearbyUsersCount} ${nearbyUsersCount === 1 ? 'Person' : 'Personen'} aus deiner Region`,
      onClick: () => {
        document.getElementById('follow-up-actions')?.scrollIntoView({ behavior: 'smooth' })
      },
      badge: `${nearbyUsersCount}`,
      color: 'purple',
      priority: 'primary',
    })
  }

  // Timeline view
  actions.push({
    icon: BarChart3,
    title: 'Meine Timeline',
    description: 'Alle deine Erfahrungen im Überblick',
    href: '/profile/timeline',
    color: 'cyan',
    priority: 'secondary',
  })

  // Expert review for certain categories
  if (['ufo-uap', 'near-death-experience', 'precognition'].includes(category)) {
    actions.push({
      icon: Microscope,
      title: 'Experten-Review',
      description: 'Lass deine Erfahrung analysieren',
      href: `/experiences/${experienceId}/request-review`,
      color: 'emerald',
      priority: 'secondary',
    })
  }

  // Suggest adding media if missing
  if (!hasMedia) {
    actions.push({
      icon: Camera,
      title: 'Details ergänzen',
      description: 'Fotos, Skizzen oder Zeugen hinzufügen',
      href: `/experiences/${experienceId}/edit`,
      color: 'amber',
      priority: 'secondary',
    })
  }

  // Global map view
  if (hasLocation) {
    actions.push({
      icon: Globe,
      title: 'Globale Karte',
      description: 'Wo wurde dieses Phänomen weltweit gemeldet?',
      href: `/map?category=${category}`,
      color: 'green',
      priority: 'secondary',
    })
  }

  // Split into primary and secondary
  const primaryActions = actions.filter((a) => a.priority === 'primary')
  const secondaryActions = actions.filter((a) => a.priority === 'secondary')

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      hover: 'hover:bg-blue-500/20 hover:border-blue-500/50',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      hover: 'hover:bg-purple-500/20 hover:border-purple-500/50',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/50',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/50',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      hover: 'hover:bg-amber-500/20 hover:border-amber-500/50',
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      hover: 'hover:bg-green-500/20 hover:border-green-500/50',
    },
  } as const

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className={`h-6 w-6 ${theme.accentColor}`} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Empfohlene nächste Schritte</h2>
      </div>

      {/* Primary Actions */}
      {primaryActions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {primaryActions.map((action, index) => {
            const Icon = action.icon as any
            const colors = colorClasses[action.color as keyof typeof colorClasses]

            const content = (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8 + index * 0.1, duration: 0.4 }}
                className={`group relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-6 backdrop-blur-sm transition-all ${colors.hover} cursor-pointer`}
              >
                {/* Badge */}
                {action.badge && (
                  <div className={`absolute right-4 top-4 rounded-full ${colors.bg} ${colors.border} border px-2.5 py-1 text-xs font-bold ${colors.text}`}>
                    {action.badge}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`rounded-lg ${colors.bg} ${colors.border} border p-3`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>

                  <div className="flex-1">
                    <h3 className={`mb-1 font-semibold ${colors.text}`}>{action.title}</h3>
                    <p className="text-sm text-white/70">{action.description}</p>

                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-white/50 transition-all group-hover:text-white/80">
                      <span>Los geht's</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )

            if (action.href) {
              return (
                <Link key={index} href={action.href}>
                  {content}
                </Link>
              )
            }

            return (
              <button key={index} onClick={action.onClick} className="w-full text-left">
                {content}
              </button>
            )
          })}
        </div>
      )}

      {/* Secondary Actions */}
      {secondaryActions.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {secondaryActions.map((action, index) => {
            const Icon = action.icon as any
            const colors = colorClasses[action.color as keyof typeof colorClasses]

            const content = (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 + index * 0.1, duration: 0.3 }}
                className={`group flex items-center gap-3 rounded-lg border ${colors.border} ${colors.bg} p-4 backdrop-blur-sm transition-all ${colors.hover} cursor-pointer`}
              >
                <div className={`rounded-lg ${colors.bg} p-2`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${colors.text} truncate`}>
                    {action.title}
                  </div>
                  <div className="text-xs text-white/50 truncate">{action.description}</div>
                </div>

                <ArrowRight className={`h-4 w-4 ${colors.text} flex-shrink-0 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1`} />
              </motion.div>
            )

            if (action.href) {
              return (
                <Link key={index} href={action.href}>
                  {content}
                </Link>
              )
            }

            return (
              <button key={index} onClick={action.onClick} className="w-full text-left">
                {content}
              </button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
