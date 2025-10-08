import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function usePrefetch() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const prefetch = useCallback(
    (href: string, experienceId?: string) => {
      // Prefetch the page route
      router.prefetch(href)

      // Prefetch the experience data if ID is provided
      if (experienceId) {
        queryClient.prefetchQuery({
          queryKey: ['experience', experienceId],
          queryFn: async () => {
            // Data will be prefetched when user navigates to the page
            // The actual fetch happens in the experience detail page
            return null
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
        })
      }
    },
    [router, queryClient]
  )

  return prefetch
}
