'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, MapPin, Lightbulb, Target, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface EnhancedStatsGridProps {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalExperiences: number
  totalContributions: number
  connectionsCount?: number
  percentile?: number
  geographicReach?: number
  patternCount?: number
}

export function EnhancedStatsGrid({
  totalXp,
  level,
  currentStreak,
  longestStreak,
  totalExperiences,
  totalContributions,
  connectionsCount = 0,
  percentile = 50,
  geographicReach = 0,
  patternCount = 0,
}: EnhancedStatsGridProps) {
  const stats = [
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      label: 'Total XP',
      value: totalXp.toLocaleString(),
      subtitle: `Level ${level}`,
      bg: 'bg-purple-50',
    },
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      label: 'Current Streak',
      value: `${currentStreak} days`,
      subtitle: `Longest: ${longestStreak} days`,
      bg: 'bg-blue-50',
    },
    {
      icon: <Award className="h-6 w-6 text-cyan-600" />,
      label: 'Experiences',
      value: totalExperiences,
      subtitle: `${totalContributions} contributions`,
      bg: 'bg-cyan-50',
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      label: 'Connections',
      value: connectionsCount,
      subtitle: 'XP Twins & Friends',
      bg: 'bg-green-50',
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-amber-600" />,
      label: 'Patterns Found',
      value: patternCount,
      subtitle: 'Pattern discoveries',
      bg: 'bg-amber-50',
    },
    {
      icon: <MapPin className="h-6 w-6 text-red-600" />,
      label: 'Geographic Reach',
      value: `${geographicReach} locations`,
      subtitle: `Top ${percentile}%`,
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: "easeOut"
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <motion.div
                className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mb-3`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {stat.icon}
              </motion.div>
              <motion.p
                className="text-2xl font-bold mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: index * 0.1 + 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm font-medium text-foreground mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
