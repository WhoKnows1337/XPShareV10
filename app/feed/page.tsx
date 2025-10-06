import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, MapPin, Calendar } from 'lucide-react'

export default async function FeedPage() {
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

        {/* Recent Experiences Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Experiences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-slate-300" aria-hidden="true" />
              <h3 className="mb-2 text-lg font-semibold text-slate-700">
                No experiences yet
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                Start by sharing your first extraordinary experience
              </p>
              <Link href="/submit">
                <Button>Share Your First Experience</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <div className="mt-8 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50 p-6 text-center">
          <h3 className="mb-2 font-semibold text-purple-900">🚧 Feed Coming Soon</h3>
          <p className="text-sm text-purple-700">
            The experience feed is currently under development. Soon you'll be able to browse,
            filter, and discover experiences from the community!
          </p>
        </div>
      </div>
    </div>
  )
}
