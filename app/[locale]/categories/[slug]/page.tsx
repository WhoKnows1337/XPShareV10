import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CategoryViewClient } from './category-view-client'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    sort?: string
    view?: string
  }>
}

const categoryMetadata: Record<string, { name: string; description: string; icon: string }> = {
  ufo: {
    name: 'UFO Sichtungen',
    description: 'Unidentifizierte Flugobjekte und außergewöhnliche Himmelserscheinungen',
    icon: '🛸',
  },
  paranormal: {
    name: 'Paranormal',
    description: 'Unerklärliche Phänomene und übernatürliche Begegnungen',
    icon: '👻',
  },
  dreams: {
    name: 'Träume',
    description: 'Außergewöhnliche Träume und luzide Traumerfahrungen',
    icon: '💭',
  },
  psychedelic: {
    name: 'Psychedelic',
    description: 'Bewusstseinserweiternde Erfahrungen und Erkenntnisse',
    icon: '🍄',
  },
  spiritual: {
    name: 'Spiritual',
    description: 'Spirituelle Erweckungen und transzendente Momente',
    icon: '🙏',
  },
  synchronicity: {
    name: 'Synchronicity',
    description: 'Bedeutsame Zufälle und kosmische Verbindungen',
    icon: '🔮',
  },
  nde: {
    name: 'Near-Death',
    description: 'Nahtoderfahrungen und Grenzerlebnisse',
    icon: '💫',
  },
  other: {
    name: 'Other',
    description: 'Andere außergewöhnliche Erfahrungen',
    icon: '📦',
  },
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { slug } = await params
  const search = await searchParams

  // Check if category exists
  const categoryInfo = categoryMetadata[slug]
  if (!categoryInfo) {
    notFound()
  }

  // Get category stats
  const { count: totalExperiences } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('category', slug)
    .eq('visibility', 'public')

  const { count: todayCount } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('category', slug)
    .eq('visibility', 'public')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // Get active users count
  const { data: activeUsers } = (await supabase
    .from('experiences')
    .select('user_id')
    .eq('category', slug)
    .eq('visibility', 'public')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())) as { data: { user_id: string }[] | null; error: any }

  const uniqueUsers = new Set(activeUsers?.map(e => e.user_id)).size

  // Get experiences for this category
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
    .eq('category', slug)
    .eq('visibility', 'public')

  // Apply sorting
  const sort = search.sort || 'newest'
  switch (sort) {
    case 'hot':
      query = query.order('upvote_count', { ascending: false })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: experiences, error } = await query.limit(20)

  if (error) {
    console.error('Category experiences error:', error)
  }

  // Get top tags for this category
  const { data: experiencesWithTags } = await supabase
    .from('experiences')
    .select('tags')
    .eq('category', slug)
    .eq('visibility', 'public')
    .not('tags', 'is', null)

  const tagCounts: Record<string, number> = {}
  experiencesWithTags?.forEach((exp: any) => {
    exp.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))

  // Get location hotspots
  const { data: experiencesWithLocation } = await supabase
    .from('experiences')
    .select('location_text')
    .eq('category', slug)
    .eq('visibility', 'public')
    .not('location_text', 'is', null)

  const locationCounts: Record<string, number> = {}
  experiencesWithLocation?.forEach((exp: any) => {
    if (exp.location_text) {
      locationCounts[exp.location_text] = (locationCounts[exp.location_text] || 0) + 1
    }
  })

  const hotspots = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <CategoryViewClient
        category={{
          slug,
          ...categoryInfo,
        }}
        stats={{
          totalExperiences: totalExperiences || 0,
          todayCount: todayCount || 0,
          activeUsers: uniqueUsers,
        }}
        experiences={experiences || []}
        topTags={topTags}
        hotspots={hotspots}
      />
    </div>
  )
}
