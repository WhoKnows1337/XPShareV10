import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Flag, BadgeCheck } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalExperiences },
    { count: pendingReports },
    { count: totalBadges },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('experiences').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('user_badges').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Experiences',
      value: totalExperiences || 0,
      icon: FileText,
      color: 'text-green-500',
    },
    {
      title: 'Pending Reports',
      value: pendingReports || 0,
      icon: Flag,
      color: 'text-red-500',
    },
    {
      title: 'Badges Earned',
      value: totalBadges || 0,
      icon: BadgeCheck,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Activity feed coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
