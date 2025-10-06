import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, Flag, BadgeCheck, FolderOpen, MessageSquare, Plus, TrendingUp, Download } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats for question catalog dashboard
  const [
    { count: totalCategories },
    { count: totalQuestions },
  ] = await Promise.all([
    supabase.from('question_categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('dynamic_questions').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Fetch answer statistics from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: analyticsData } = await supabase
    .from('question_analytics')
    .select('answered_count, shown_count')
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])

  const totalAnswers = analyticsData?.reduce((sum, row) => sum + (row.answered_count || 0), 0) || 0
  const totalShown = analyticsData?.reduce((sum, row) => sum + (row.shown_count || 0), 0) || 0
  const answerRate = totalShown > 0 ? Math.round((totalAnswers / totalShown) * 100) : 0

  // Fetch categories with question counts and analytics
  const { data: categories } = await supabase
    .from('question_categories')
    .select(`
      *,
      questions:dynamic_questions(count)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(6)

  // Fetch analytics summary for categories
  const categoryIds = categories?.map(c => c.id) || []
  const { data: categoryAnalytics } = await supabase
    .from('question_analytics_summary')
    .select('category_id, answer_rate_percent')
    .in('category_id', categoryIds)

  // Map analytics to categories
  const categoriesWithAnalytics = categories?.map(category => {
    const questionCount = category.questions?.[0]?.count || 0
    const analytics = categoryAnalytics?.filter(a => a.category_id === category.id) || []
    const avgRate = analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + (a.answer_rate_percent || 0), 0) / analytics.length)
      : 0

    return {
      ...category,
      questionCount,
      answerRate: avgRate
    }
  })

  // Fetch recent changes
  const { data: recentChanges } = await supabase
    .from('question_change_history')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Kategorien',
      value: totalCategories || 0,
      icon: FolderOpen,
      color: 'text-orange-500',
      href: '/admin/questions',
    },
    {
      title: 'Fragen',
      value: totalQuestions || 0,
      icon: MessageSquare,
      color: 'text-teal-500',
      href: '/admin/questions',
    },
    {
      title: 'Antworten',
      subtitle: '(7 Tage)',
      value: totalAnswers.toLocaleString('de-DE'),
      icon: FileText,
      color: 'text-green-500',
    },
    {
      title: 'Rate',
      subtitle: '(Durchschnitt)',
      value: `${answerRate}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Overview of platform statistics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/admin/export/stats?format=csv">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </Link>
          <Link href="/api/admin/export/stats?format=json">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/questions">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Manage Questions
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const content = (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
            </>
          )

          return stat.href ? (
            <Link href={stat.href} key={stat.title}>
              <Card className="cursor-pointer transition-colors hover:bg-accent">
                {content}
              </Card>
            </Link>
          ) : (
            <Card key={stat.title}>{content}</Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Question Categories</CardTitle>
            <Link href="/admin/questions">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoriesWithAnalytics && categoriesWithAnalytics.length > 0 ? (
              categoriesWithAnalytics.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.questionCount} Fragen | {category.answerRate}% Rate
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/categories/${category.slug}`}>
                      <Button variant="ghost" size="sm">
                        Bearbeiten
                      </Button>
                    </Link>
                    <Link href={`/admin/analytics?category=${category.id}`}>
                      <Button variant="ghost" size="sm">
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No categories found</p>
            )}
            <div className="pt-3 border-t">
              <Link href="/admin/questions">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Neue Kategorie
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentChanges && recentChanges.length > 0 ? (
              recentChanges.map((change) => (
                <div key={change.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {change.entity_type === 'category' ? 'Category' : 'Question'}{' '}
                      {change.change_type}
                    </p>
                    <p className="text-xs text-muted-foreground">{change.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(change.changed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent changes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
