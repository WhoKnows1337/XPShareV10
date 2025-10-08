'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Sparkles, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SimilarUser {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  bio?: string
  similarity_score: number
  shared_categories: string[]
  shared_experiences_count: number
}

interface SimilarUsersCardProps {
  userId: string
}

export function SimilarUsersCard({ userId }: SimilarUsersCardProps) {
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarUsers = async () => {
      const supabase = createClient()

      try {
        // Call RPC function to find similar users based on embeddings
        const { data, error } = await (supabase as any)
          .rpc('find_similar_users', {
            target_user_id: userId,
            match_threshold: 0.7,
            match_count: 5
          })

        if (error) {
          console.error('Error fetching similar users:', error)
          setLoading(false)
          return
        }

        if (data) {
          setSimilarUsers(data)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarUsers()
  }, [userId])

  if (loading) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-muted-foreground">Finding similar users...</p>
        </CardContent>
      </Card>
    )
  }

  if (!similarUsers || similarUsers.length === 0) {
    return null
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-500" />
          <Sparkles className="h-4 w-4 text-purple-500" />
          Similar Users
        </CardTitle>
        <CardDescription>
          Users with experiences similar to yours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {similarUsers.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="block group"
          >
            <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-white/80 hover:shadow-md">
              <Avatar className="h-12 w-12 border-2 border-purple-200">
                <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {(user.display_name || user.username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm truncate group-hover:text-purple-600 transition-colors">
                    {user.display_name || user.username}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    <span>{Math.round(user.similarity_score * 100)}%</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {user.bio || `@${user.username}`}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {user.shared_categories && user.shared_categories.slice(0, 3).map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {user.shared_experiences_count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {user.shared_experiences_count} shared interests
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            🤖 AI-powered matching based on your experience embeddings
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
