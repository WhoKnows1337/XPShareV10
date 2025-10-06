import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserStats } from '@/components/profile/user-stats'
import { BadgesShowcase } from '@/components/profile/badges-showcase'
import { Settings, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch profile data directly from database
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get user badges with full badge data
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select(`
      earned_at,
      badges (
        id,
        name,
        description,
        icon,
        rarity,
        xp_reward
      )
    `)
    .eq('user_id', id)
    .order('earned_at', { ascending: false })

  // Get recent experiences (first 5)
  const { data: recentExperiences } = await supabase
    .from('experiences')
    .select('id, title, category, created_at')
    .eq('user_id', id)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get experience count
  const { count: experienceCount } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)

  // Calculate level
  const level = Math.floor((profile.total_xp || 0) / 100) + 1

  // Format profile data
  const profileData = {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name || profile.username,
    avatar_url: profile.avatar_url || null,
    bio: profile.bio || null,
    location_city: profile.location_city || null,
    location_country: profile.location_country || null,
    total_xp: profile.total_xp || 0,
    level,
    current_streak: profile.current_streak || 0,
    longest_streak: profile.longest_streak || 0,
    total_experiences: experienceCount || 0,
    total_contributions: profile.total_contributions || 0,
    badges: userBadges?.map((ub: any) => ({
      id: ub.badges.id,
      name: ub.badges.name,
      description: ub.badges.description,
      icon_name: ub.badges.icon_name,
      rarity: ub.badges.rarity,
      earned_at: ub.earned_at,
    })) || [],
    recent_experiences: recentExperiences || [],
    created_at: profile.created_at,
  }

  const isOwnProfile = currentUser?.id === id

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              {/* Avatar */}
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileData.avatar_url} alt={profileData.username} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profileData.display_name)}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{profileData.display_name}</h1>
                <p className="text-slate-600">@{profileData.username}</p>

                {profileData.bio && (
                  <p className="mt-2 text-slate-700">{profileData.bio}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 md:justify-start">
                  {(profileData.location_city || profileData.location_country) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {[profileData.location_city, profileData.location_country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>
                      Joined {new Date(profileData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {isOwnProfile && (
                <Link href={`/profile/${id}/edit`}>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-8">
          <UserStats
            totalXp={profileData.total_xp}
            level={profileData.level}
            currentStreak={profileData.current_streak}
            longestStreak={profileData.longest_streak}
            totalExperiences={profileData.total_experiences}
            totalContributions={profileData.total_contributions}
          />
        </div>

        {/* Badges & XP Showcase */}
        <div className="mb-8">
          <BadgesShowcase
            userBadges={userBadges?.map((ub: any) => ({
              id: ub.badges.id,
              name: ub.badges.name,
              description: ub.badges.description,
              icon: ub.badges.icon,
              rarity: ub.badges.rarity,
              xp_reward: ub.badges.xp_reward,
              earned_at: ub.earned_at,
            })) || []}
            totalXP={profileData.total_xp}
          />
        </div>

        {/* Recent Experiences */}
        {profileData.recent_experiences && profileData.recent_experiences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Experiences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData.recent_experiences.map((exp: any) => (
                  <Link
                    key={exp.id}
                    href={`/experience/${exp.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{exp.title}</h3>
                        <Badge variant="outline" className="mt-1">
                          {exp.category}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-600">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
