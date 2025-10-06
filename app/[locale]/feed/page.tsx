import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, MapPin, Calendar } from 'lucide-react'
import { ExperienceCard } from '@/components/experience/experience-card'
import { FeedFilters } from '@/components/feed/feed-filters'

interface FeedPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
  }>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single()

  // Await searchParams
  const params = await searchParams

  // Build query based on filters
  let query = supabase
    .from('experiences')
    .select(`
      *,
      user_profiles!experiences_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('visibility', 'public')

  // Apply category filter
  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  // Apply sorting
  const sort = params.sort || 'latest'
  switch (sort) {
    case 'popular':
      query = query.order('upvote_count', { ascending: false })
      break
    case 'views':
      query = query.order('view_count', { ascending: false })
      break
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Fetch experiences
  const { data: experiences, error } = await query.limit(20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Welcome back, {profile?.display_name || profile?.username || 'User'}!
          </h1>
          <p className="text-slate-600">Discover and share extraordinary experiences</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-purple-100 p-3">
                <Sparkles className="h-6 w-6 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-semibold">Share Experience</h3>
              <p className="mb-4 text-sm text-slate-600">
                Tell your story and discover patterns
              </p>
              <Link href="/submit">
                <Button className="w-full">Start Sharing</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <MapPin className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-semibold">Explore Map</h3>
              <p className="mb-4 text-sm text-slate-600">
                View experiences on a global map
              </p>
              <Link href="/map">
                <Button variant="outline" className="w-full">
                  View Map
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Calendar className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-semibold">Your Profile</h3>
              <p className="mb-4 text-sm text-slate-600">
                View your experiences and stats
              </p>
              <Link href={`/profile/${user.id}`}>
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <FeedFilters />

        {/* Recent Experiences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {params.category && params.category !== 'all'
                ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} Experiences`
                : 'Recent Experiences'}
            </h2>
            {experiences && experiences.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {!experiences || experiences.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Sparkles className="mb-4 h-12 w-12 text-slate-300" aria-hidden="true" />
                  <h3 className="mb-2 text-lg font-semibold text-slate-700">
                    No experiences yet
                  </h3>
                  <p className="mb-6 text-sm text-slate-600">
                    Be the first to share an extraordinary experience!
                  </p>
                  <Link href="/submit">
                    <Button>Share Your First Experience</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {experiences.map((experience: any) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
