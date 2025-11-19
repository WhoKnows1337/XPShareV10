'use client'

import { motion } from 'framer-motion'
import { Bell, Users, MessageCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { getCategoryTheme } from '@/lib/config/category-themes'

interface FollowUpActionsProps {
  category: string
  experienceId: string
  nearbyUsersCount?: number
  pendingQuestionsCount?: number
}

export function FollowUpActions({
  category,
  experienceId,
  nearbyUsersCount = 0,
  pendingQuestionsCount = 0,
}: FollowUpActionsProps) {
  const theme = getCategoryTheme(category)
  const [notifications, setNotifications] = useState({
    similarInLocation: false,
    newInCategory: false,
    patternUpdates: false,
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
    // TODO: Implement actual notification preference API call
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Bell className={`h-6 w-6 ${theme.accentColor}`} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Bleib auf dem Laufenden</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className={`rounded-xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradient} p-6 backdrop-blur-sm`}
        >
          <div className="mb-4 flex items-center gap-2">
            <Bell className={`h-5 w-5 ${theme.accentColor}`} />
            <h3 className="font-semibold text-white">Benachrichtigungen</h3>
          </div>

          <div className="space-y-3">
            {/* Notification Option 1 */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <input
                type="checkbox"
                checked={notifications.similarInLocation}
                onChange={() => toggleNotification('similarInLocation')}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  Ähnliche Meldungen in deiner Region
                </div>
                <div className="text-xs text-white/60">
                  Werde benachrichtigt bei neuen Erfahrungen in deiner Nähe
                </div>
              </div>
            </label>

            {/* Notification Option 2 */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <input
                type="checkbox"
                checked={notifications.newInCategory}
                onChange={() => toggleNotification('newInCategory')}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  Neue {category.replace(/-/g, ' ')} Berichte
                </div>
                <div className="text-xs text-white/60">
                  Bleib informiert über ähnliche Phänomene weltweit
                </div>
              </div>
            </label>

            {/* Notification Option 3 */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <input
                type="checkbox"
                checked={notifications.patternUpdates}
                onChange={() => toggleNotification('patternUpdates')}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Pattern Updates</div>
                <div className="text-xs text-white/60">
                  Erhalte Updates wenn neue Muster entdeckt werden
                </div>
              </div>
            </label>
          </div>

          {/* Save Button */}
          {Object.values(notifications).some((v) => v) && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 w-full rounded-lg ${theme.gradient} border ${theme.borderColor} px-4 py-2 font-medium text-white transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Einstellungen speichern
              </div>
            </motion.button>
          )}
        </motion.div>

        {/* Community Connect */}
        <div className="space-y-4">
          {/* Nearby Users */}
          {nearbyUsersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 to-pink-950/20 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Community</h3>
                </div>
                <div className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-bold text-purple-400">
                  {nearbyUsersCount}
                </div>
              </div>

              <p className="mb-4 text-sm text-white/80">
                {nearbyUsersCount} {nearbyUsersCount === 1 ? 'Person' : 'Personen'} in
                deiner Region {nearbyUsersCount === 1 ? 'möchte' : 'möchten'} sich
                austauschen
              </p>

              <button className="w-full rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 font-medium text-purple-200 transition-all hover:bg-purple-500/20 hover:text-white">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Kontakt aufnehmen
                </div>
              </button>
            </motion.div>
          )}

          {/* Pending Questions */}
          {pendingQuestionsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-blue-950/20 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Fragen</h3>
                </div>
                <div className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-400">
                  {pendingQuestionsCount}
                </div>
              </div>

              <p className="mb-4 text-sm text-white/80">
                {pendingQuestionsCount}{' '}
                {pendingQuestionsCount === 1 ? 'Person hat' : 'Personen haben'} Fragen zu
                deiner Erfahrung
              </p>

              <button className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 font-medium text-cyan-200 transition-all hover:bg-cyan-500/20 hover:text-white">
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Fragen ansehen
                </div>
              </button>
            </motion.div>
          )}

          {/* Placeholder if no community activity */}
          {nearbyUsersCount === 0 && pendingQuestionsCount === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-white/40" />
                <h3 className="font-semibold text-white/60">Community</h3>
              </div>
              <p className="text-sm text-white/50">
                Du bist der Erste in deiner Region! Teile deine Erfahrung, um andere zu
                ermutigen.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
