import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/search/search-input'
import { ExperienceCard } from '@/components/experience/experience-card'
import { Search as SearchIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const searchQuery = params.q?.trim()
  let experiences: any[] = []

  if (searchQuery) {
    // Full-text search using PostgreSQL text search
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

    // Search in title and story_text using ilike (case-insensitive)
    query = query.or(
      `title.ilike.%${searchQuery}%,story_text.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`
    )

    // Apply category filter if provided
    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      experiences = data
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-purple-100 p-4">
              <SearchIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold">Search Experiences</h1>
          <p className="text-muted-foreground">
            Find extraordinary experiences from the community
          </p>
        </div>

        {/* Search Input */}
        <SearchInput initialQuery={searchQuery} />

        {/* Results */}
        <div className="mt-8">
          {!searchQuery ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <SearchIcon className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 text-lg font-semibold text-slate-700">
                    Start searching
                  </h3>
                  <p className="mb-6 text-sm text-slate-600">
                    Enter keywords to search through experiences, tags, and categories
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link href="/search?q=dream">
                      <Button variant="outline" size="sm">
                        Dream
                      </Button>
                    </Link>
                    <Link href="/search?q=lights">
                      <Button variant="outline" size="sm">
                        Lights
                      </Button>
                    </Link>
                    <Link href="/search?q=spiritual">
                      <Button variant="outline" size="sm">
                        Spiritual
                      </Button>
                    </Link>
                    <Link href="/search?q=meditation">
                      <Button variant="outline" size="sm">
                        Meditation
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : experiences.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <SearchIcon className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 text-lg font-semibold text-slate-700">
                    No results found
                  </h3>
                  <p className="mb-6 text-sm text-slate-600">
                    Try different keywords or browse{' '}
                    <Link href="/feed" className="text-purple-600 hover:underline">
                      all experiences
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-sm text-muted-foreground">
                  {experiences.length} result{experiences.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {experiences.map((experience: any) => (
                  <ExperienceCard key={experience.id} experience={experience} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        {searchQuery && experiences.length > 0 && (
          <div className="mt-8 rounded-lg border bg-card p-4">
            <h3 className="mb-2 font-semibold">Search Tips</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Use multiple keywords for better results</li>
              <li>• Try searching for tags, locations, or categories</li>
              <li>• Search is case-insensitive</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
