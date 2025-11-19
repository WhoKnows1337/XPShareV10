'use client'

import { motion } from 'framer-motion'
import { Clock, Calendar, TrendingUp, Zap } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'
import { format, differenceInDays, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface TimelineEvent {
  id: string
  date: string
  title: string
  count?: number
  isUserExperience?: boolean
}

interface TemporalTimelineProps {
  category: string
  userExperienceDate: string
  similarExperiences: TimelineEvent[]
  showPrediction?: boolean
}

export function TemporalTimeline({
  category,
  userExperienceDate,
  similarExperiences,
  showPrediction = false,
}: TemporalTimelineProps) {
  const theme = getCategoryTheme(category)

  // Sort experiences by date
  const sortedEvents = [...similarExperiences].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Calculate time gaps between events
  const gaps = []
  for (let i = 1; i < sortedEvents.length; i++) {
    const gap = differenceInDays(
      parseISO(sortedEvents[i].date),
      parseISO(sortedEvents[i - 1].date)
    )
    gaps.push(gap)
  }

  const avgGap = gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0

  // Calculate frequency stats
  const last30Days = sortedEvents.filter((event) => {
    const daysDiff = differenceInDays(new Date(), parseISO(event.date))
    return daysDiff <= 30
  }).length

  const last7Days = sortedEvents.filter((event) => {
    const daysDiff = differenceInDays(new Date(), parseISO(event.date))
    return daysDiff <= 7
  }).length

  // Find peaks (clusters of events)
  const clusters: { start: Date; end: Date; count: number }[] = []
  let currentCluster: TimelineEvent[] = []

  sortedEvents.forEach((event, index) => {
    if (currentCluster.length === 0) {
      currentCluster.push(event)
    } else {
      const lastEvent = currentCluster[currentCluster.length - 1]
      const gap = differenceInDays(parseISO(event.date), parseISO(lastEvent.date))

      if (gap <= 14) { // Events within 2 weeks belong to same cluster
        currentCluster.push(event)
      } else {
        if (currentCluster.length >= 2) {
          clusters.push({
            start: parseISO(currentCluster[0].date),
            end: parseISO(currentCluster[currentCluster.length - 1].date),
            count: currentCluster.length,
          })
        }
        currentCluster = [event]
      }
    }

    // Last cluster
    if (index === sortedEvents.length - 1 && currentCluster.length >= 2) {
      clusters.push({
        start: parseISO(currentCluster[0].date),
        end: parseISO(currentCluster[currentCluster.length - 1].date),
        count: currentCluster.length,
      })
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Clock className={`h-6 w-6 ${theme.accentColor}`} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Zeitliche Muster</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Last 7 Days */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.0, duration: 0.4 }}
          className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center backdrop-blur-sm"
        >
          <div className="mb-2 text-3xl font-bold text-cyan-400">{last7Days}</div>
          <div className="flex items-center justify-center gap-1 text-xs text-white/60">
            <Calendar className="h-3 w-3" />
            <span>Letzte 7 Tage</span>
          </div>
        </motion.div>

        {/* Last 30 Days */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.1, duration: 0.4 }}
          className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-center backdrop-blur-sm"
        >
          <div className="mb-2 text-3xl font-bold text-blue-400">{last30Days}</div>
          <div className="flex items-center justify-center gap-1 text-xs text-white/60">
            <Calendar className="h-3 w-3" />
            <span>Letzte 30 Tage</span>
          </div>
        </motion.div>

        {/* Average Gap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.4 }}
          className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-center backdrop-blur-sm"
        >
          <div className="mb-2 text-3xl font-bold text-purple-400">{avgGap}</div>
          <div className="flex items-center justify-center gap-1 text-xs text-white/60">
            <TrendingUp className="h-3 w-3" />
            <span>⌀ Tage zwischen</span>
          </div>
        </motion.div>
      </div>

      {/* Timeline Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.3, duration: 0.5 }}
        className={`rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-6 backdrop-blur-sm`}
      >
        <div className="space-y-4">
          {/* Timeline Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Ereignis-Timeline</h3>
            <div className="text-xs text-white/50">
              {sortedEvents.length} {sortedEvents.length === 1 ? 'Ereignis' : 'Ereignisse'}
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            {/* Events */}
            <div className="space-y-4">
              {sortedEvents.slice(-10).map((event, index) => {
                const isUser = event.isUserExperience
                const daysSince = differenceInDays(new Date(), parseISO(event.date))

                return (
                  <motion.div
                    key={`${event.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.4 + index * 0.1, duration: 0.3 }}
                    className="relative flex items-start gap-4 pl-10"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-3 top-2 h-3 w-3 rounded-full border-2 ${
                        isUser
                          ? 'border-blue-500 bg-blue-400 shadow-lg shadow-blue-500/50'
                          : 'border-white/30 bg-white/20'
                      }`}
                    />

                    {/* Event Card */}
                    <div
                      className={`flex-1 rounded-lg border ${
                        isUser ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/10 bg-white/5'
                      } p-3 backdrop-blur-sm transition-all hover:bg-white/10`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium ${
                              isUser ? 'text-blue-300' : 'text-white/80'
                            } truncate`}
                          >
                            {event.title}
                          </div>
                          <div className="text-xs text-white/50">
                            {format(parseISO(event.date), 'd. MMM yyyy', { locale: de })}
                            {daysSince === 0 && ' · Heute'}
                            {daysSince === 1 && ' · Gestern'}
                            {daysSince > 1 && ` · vor ${daysSince} Tagen`}
                          </div>
                        </div>

                        {isUser && (
                          <div className="flex-shrink-0 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300">
                            Du
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Show more hint if needed */}
          {sortedEvents.length > 10 && (
            <div className="text-center text-xs text-white/40">
              + {sortedEvents.length - 10} weitere Ereignisse
            </div>
          )}
        </div>
      </motion.div>

      {/* Cluster Detection */}
      {clusters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.5 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-amber-300">
                {clusters.length} {clusters.length === 1 ? 'Cluster' : 'Cluster'} erkannt
              </h3>
              <p className="text-sm text-white/70">
                Erhöhte Aktivität zwischen{' '}
                {format(clusters[0].start, 'd. MMM', { locale: de })} und{' '}
                {format(clusters[clusters.length - 1].end, 'd. MMM yyyy', { locale: de })} mit
                insgesamt {clusters.reduce((sum, c) => sum + c.count, 0)} Ereignissen
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prediction (if enabled) */}
      {showPrediction && avgGap > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.5 }}
          className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-purple-300">Vorhersage</h3>
              <p className="text-sm text-white/70">
                Basierend auf dem bisherigen Muster (~{avgGap} Tage Abstand) könnte das nächste
                Ereignis in ca. {avgGap} Tagen gemeldet werden.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
