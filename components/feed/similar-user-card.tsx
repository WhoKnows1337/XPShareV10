'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Sparkles, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface SimilarUser {
  user_id: string
  username: string
  avatar_url: string | null
  similarity_score: number
  common_categories: string[]
}

interface SimilarUserCardProps {
  currentUserId: string
}

export function SimilarUserCard({ currentUserId }: SimilarUserCardProps) {
  const { data: similarUser, isLoading } = useQuery({
    queryKey: ['similar-user', currentUserId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await (supabase as any).rpc('find_similar_users', {
        target_user_id: currentUserId,
        limit_count: 1
      })

      if (error) {
        console.error('Error finding similar users:', error)
        return null
      }

      return data && data.length > 0 ? data[0] : null
    },
    enabled: !!currentUserId
  })

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!similarUser) return null

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI-SUGGESTION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            {similarUser.avatar_url && (
              <AvatarImage src={similarUser.avatar_url} alt={similarUser.username} />
            )}
            <AvatarFallback>{getInitials(similarUser.username)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">@{similarUser.username}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round(similarUser.similarity_score)}% ähnliche Erfahrungen!
            </p>
          </div>
        </div>

        {similarUser.common_categories && similarUser.common_categories.length > 0 && (
          <div className="space-y-1 text-xs mb-3">
            <p className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {similarUser.common_categories.length} gemeinsame Kategorien
            </p>
          </div>
        )}

        <Link href={`/profile/${similarUser.user_id}`}>
          <Button className="w-full" size="sm">
            Connect with @{similarUser.username}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
