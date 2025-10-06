import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Zap, Flame, Star } from 'lucide-react'

interface UserStatsProps {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalExperiences: number
  totalContributions: number
}

export function UserStats({
  totalXp,
  level,
  currentStreak,
  longestStreak,
  totalExperiences,
  totalContributions,
}: UserStatsProps) {
  const stats = [
    {
      label: 'Level',
      value: level,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Total XP',
      value: totalXp.toLocaleString(),
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Current Streak',
      value: `${currentStreak} days`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Experiences',
      value: totalExperiences,
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
