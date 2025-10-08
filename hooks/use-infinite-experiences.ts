import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface ExperienceFilters {
  category?: string
  tab?: string
  sort?: string
  radius?: string
  dateRange?: string
}

interface ExperiencePage {
  experiences: any[]
  nextCursor: number | null
  hasMore: boolean
}

const ITEMS_PER_PAGE = 20

export function useInfiniteExperiences(
  filters: ExperienceFilters,
  userId?: string
) {
  return useInfiniteQuery<ExperiencePage>({
    queryKey: ['experiences-infinite', filters, userId],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient()
      const offset = pageParam as number

      // Build base query
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
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      // Apply date range filter
      if (filters.dateRange) {
        const now = new Date()
        let dateFrom: Date | null = null

        switch (filters.dateRange) {
          case '24h':
            dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case '7d':
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case '90d':
            dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          case '1y':
            dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
        }

        if (dateFrom) {
          query = query.gte('created_at', dateFrom.toISOString())
        }
      }

      // Apply sorting
      const sort = filters.sort || 'latest'
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

      // Apply pagination
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

      const { data, error } = await query

      if (error) throw error

      const experiences = data || []
      const hasMore = experiences.length === ITEMS_PER_PAGE
      const nextCursor = hasMore ? offset + ITEMS_PER_PAGE : null

      return {
        experiences,
        nextCursor,
        hasMore,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
