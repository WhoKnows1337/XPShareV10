'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Users, MapPin } from 'lucide-react'
import Link from 'next/link'

interface SimilarUser {
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  similarity_score: number
  common_categories: string[]
  common_location: string | null
  experience_count: number
}

interface SimilarUserCardProps {
  currentUserId?: string
}

const categoryLabels: Record<string, string> = {
  ufo: 'UFO',
  paranormal: 'Paranormal',
  dreams: 'Träume',
  psychedelic: 'Psychedelic',
  spiritual: 'Spiritual',
  synchronicity: 'Synchronicity',
  nde: 'Nahtoderfahrungen',
  other: 'Andere'
}

export function SimilarUserCard({ currentUserId }: SimilarUserCardProps) {
  const [similarUser, setSimilarUser] = useState<SimilarUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSimilarUser() {
      if (!currentUserId) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('find_similar_users', {
          current_user_id: currentUserId,
          limit_count: 1
        })

        if (error) {
          console.error('Error fetching similar users:', error)
          setLoading(false)
          return
        }

        if (data && data.length > 0) {
          setSimilarUser(data[0])
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarUser()
  }, [currentUserId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            💡 AI-SUGGESTION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!similarUser) {
    return null
  }

  const similarityPercentage = Math.round(similarUser.similarity_score)

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          💡 AI-SUGGESTION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Link href={`/profile/${similarUser.user_id}`}>
            <Avatar className="w-14 h-14 border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <AvatarImage src={similarUser.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {similarUser.display_name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${similarUser.user_id}`}
              className="font-semibold hover:text-primary transition-colors block truncate"
            >
              @{similarUser.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              {similarUser.display_name}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {similarityPercentage}% Match
              </Badge>
            </div>
          </div>
        </div>

        {/* Similarity Insights */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary">
                {similarityPercentage}% ähnliche Erfahrungen!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {similarUser.experience_count} Erlebnisse geteilt
              </p>
            </div>
          </div>

          {/* Common Categories */}
          {similarUser.common_categories.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="text-lg flex-shrink-0">🎯</div>
              <div className="flex-1">
                <p className="text-xs font-medium mb-1">
                  Gemeinsame Kategorien:
                </p>
                <div className="flex flex-wrap gap-1">
                  {similarUser.common_categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {categoryLabels[cat] || cat}
                    </Badge>
                  ))}
                  {similarUser.common_categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{similarUser.common_categories.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Common Location */}
          {similarUser.common_location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                Beide aus <span className="font-medium">{similarUser.common_location}</span> Region
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link href={`/profile/${similarUser.user_id}`}>
          <Button className="w-full" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Profil ansehen
          </Button>
        </Link>

        {/* Aha Moment Message */}
        {similarityPercentage >= 70 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-center text-primary font-medium">
              ✨ Wow! Extrem hohe Übereinstimmung!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
