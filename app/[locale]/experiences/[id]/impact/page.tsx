import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, TrendingUp, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Database } from '@/lib/supabase/database.types'

type Experience = Database['public']['Tables']['experiences']['Row']

export default async function ImpactDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch experience
  const { data: experience, error } = (await supabase
    .from('experiences')
    .select(`
      *,
      user_profiles!experiences_user_id_fkey (
        username,
        display_name
      )
    `)
    .eq('id', id)
    .single()) as { data: Experience | null; error: any }

  if (error || !experience) {
    notFound()
  }

  // Only author can view impact dashboard
  if (!user || user.id !== experience.user_id) {
    redirect(`/experiences/${id}`)
  }

  // Fetch detailed analytics
  const { data: viewsByDay } = (await supabase
    .from('experience_views')
    .select('viewed_at')
    .eq('experience_id', id)
    .order('viewed_at', { ascending: true })) as { data: { viewed_at: string }[] | null; error: any }

  const { data: likesByDay } = (await supabase
    .from('upvotes')
    .select('created_at, user_id')
    .eq('experience_id', id)
    .order('created_at', { ascending: false })) as { data: { created_at: string; user_id: string }[] | null; error: any }

  const { data: comments } = (await supabase
    .from('comments')
    .select('created_at, user_id')
    .eq('experience_id', id)
    .order('created_at', { ascending: false })) as { data: { created_at: string; user_id: string }[] | null; error: any }

  const { data: shares } = (await supabase
    .from('experience_shares')
    .select('created_at, platform')
    .eq('experience_id', id)
    .order('created_at', { ascending: false })) as { data: { created_at: string; platform: string }[] | null; error: any }

  // Calculate metrics
  const totalViews = experience.view_count || 0
  const totalLikes = likesByDay?.length || 0
  const totalComments = comments?.length || 0
  const totalShares = shares?.length || 0
  const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0

  // Group views by day for chart
  const viewsGrouped = (viewsByDay || []).reduce((acc: Record<string, number>, view) => {
    if (view.viewed_at) {
      const date = new Date(view.viewed_at).toLocaleDateString('de-DE')
      acc[date] = (acc[date] || 0) + 1
    }
    return acc
  }, {})

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/experiences/${id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experience
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Award className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Impact Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          See how your experience is helping the community
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold">{totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalViews} {totalViews === 1 ? 'person has' : 'people have'} read your story
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reactions</p>
                <p className="text-3xl font-bold">{totalLikes}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              People connected with your experience
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-3xl font-bold">{totalComments}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Conversations started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="text-3xl font-bold">{totalShares}</p>
              </div>
              <Share2 className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              People shared your story
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Rate */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Engagement Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{engagementRate.toFixed(1)}%</span>
                <Badge variant={engagementRate > 10 ? 'default' : engagementRate > 5 ? 'secondary' : 'outline'}>
                  {engagementRate > 10 ? 'Excellent' : engagementRate > 5 ? 'Good' : 'Growing'}
                </Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(engagementRate, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalLikes + totalComments} interactions from {totalViews} views
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Views Over Time */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(viewsGrouped).slice(-7).map(([date, count]) => (
              <div key={date} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24">{date}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-primary/50 flex items-center px-3"
                    style={{ width: `${(count / Math.max(...Object.values(viewsGrouped))) * 100}%` }}
                  >
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Likes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(likesByDay || []).slice(0, 5).map((like, idx) => (
                <div key={`${like.created_at}-${idx}`} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Reaction
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {like.created_at && formatDistanceToNow(new Date(like.created_at), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
              ))}
              {(likesByDay || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reactions yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(comments || []).slice(0, 5).map((comment, idx) => (
                <div key={`${comment.created_at}-${idx}`} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Comment
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-green-500" />
                </div>
              ))}
              {(comments || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Impact Message */}
      {totalViews >= 10 && (
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎉 Amazing Impact!</h3>
                <p className="text-sm text-muted-foreground">
                  Your experience has reached <strong>{totalViews} people</strong> and sparked{' '}
                  <strong>{totalComments} conversations</strong>. You're helping others understand and process similar experiences. Keep sharing!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
