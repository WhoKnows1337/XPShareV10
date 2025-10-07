'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, MapPin, Clock } from 'lucide-react'

interface SimilarUser {
  user_id: string
  username: string
  display_name: string
  avatar_url?: string
  similarity_score: number
  common_categories: string[]
  common_location?: string
  common_experiences_count: number
}

export function SimilarUserCard() {
  const [similarUser, setSimilarUser] = useState<SimilarUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSimilarUser()
  }, [])

  const fetchSimilarUser = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/similar-users?limit=1')
      const data = await response.json()

      if (response.ok && data.users && data.users.length > 0) {
        setSimilarUser(data.users[0])
      }
    } catch (err) {
      console.error('Error fetching similar user:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            💡 AI-SUGGESTION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-purple-100 rounded" />
            <div className="h-4 bg-purple-100 rounded w-3/4" />
            <div className="h-4 bg-purple-100 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!similarUser) {
    return null
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
          💡 AI-SUGGESTION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-purple-300">
            {similarUser.avatar_url && (
              <AvatarImage src={similarUser.avatar_url} alt={similarUser.display_name} />
            )}
            <AvatarFallback className="bg-purple-200 text-purple-700">
              {similarUser.display_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{similarUser.display_name}</p>
            <p className="text-xs text-muted-foreground">@{similarUser.username}</p>
            <div className="mt-1">
              <Badge
                variant="secondary"
                className="text-xs bg-purple-200 text-purple-700 border-purple-300"
              >
                {Math.round(similarUser.similarity_score)}% ähnliche Erfahrungen!
              </Badge>
            </div>
          </div>
        </div>

        {/* Common Interests */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0 text-purple-500" />
            <span>
              <strong>{similarUser.common_categories.length}</strong> gleiche Kategorien:{' '}
              {similarUser.common_categories.slice(0, 3).join(', ')}
            </span>
          </div>

          {similarUser.common_location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-purple-500" />
              <span>
                Beide in <strong>{similarUser.common_location}</strong>
              </span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Clock className="h-3 w-3 mt-0.5 flex-shrink-0 text-purple-500" />
            <span>
              <strong>{similarUser.common_experiences_count}</strong> ähnliche Erlebnisse
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="sm"
          onClick={() => {
            // TODO: Implement connect or view profile
            window.location.href = `/profile/${similarUser.username}`
          }}
        >
          Profil ansehen
        </Button>

        {/* AI Badge */}
        <p className="text-[10px] text-center text-muted-foreground">
          AI-basierte Empfehlung basierend auf deinen Erfahrungen
        </p>
      </CardContent>
    </Card>
  )
}
