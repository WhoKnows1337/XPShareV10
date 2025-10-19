'use client'

/**
 * XP Twins Sidebar Card
 *
 * Shows the TOP XP Twin match for the viewed user
 * Only displayed on OTHER users' profiles (not own profile)
 * Fetches similarity data from user_similarity_cache table
 */

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { XPTwinsCard } from './xp-twins-card'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface XPTwinsSidebarCardProps {
  /**
   * The user whose profile is being viewed
   */
  profileUserId: string

  /**
   * The current authenticated user ID
   */
  currentUserId: string

  /**
   * Is this the user's own profile?
   */
  isOwnProfile: boolean
}

interface SimilarityData {
  score: number
  shared_categories: string[]
  match_quality: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR'
}

interface SharedExperience {
  id: string
  title: string
  category: string
  created_at: string
}

function getMatchQuality(score: number): 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' {
  if (score >= 0.8) return 'EXCELLENT'
  if (score >= 0.7) return 'VERY_GOOD'
  if (score >= 0.5) return 'GOOD'
  return 'FAIR'
}

export function XPTwinsSidebarCard({
  profileUserId,
  currentUserId,
  isOwnProfile
}: XPTwinsSidebarCardProps) {
  const [similarity, setSimilarity] = useState<SimilarityData | null>(null)
  const [sharedExperiences, setSharedExperiences] = useState<SharedExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Don't show on own profile
    if (isOwnProfile || !currentUserId) {
      setLoading(false)
      return
    }

    async function fetchSimilarity() {
      try {
        const supabase = createClient()

        // Fetch similarity between current user and profile user
        // Query handles both user_id < similar_user_id and vice versa
        // @ts-ignore - user_similarity_cache table types not yet generated
        const { data, error: queryError } = await supabase
          // @ts-ignore
          .from('user_similarity_cache')
          // @ts-ignore
          .select('similarity_score, shared_categories')
          .or(`and(user_id.eq.${currentUserId},similar_user_id.eq.${profileUserId}),and(user_id.eq.${profileUserId},similar_user_id.eq.${currentUserId})`)
          .maybeSingle()

        // If queryError but not "no rows" error, log it
        if (queryError && queryError.code !== 'PGRST116') {
          console.error('Error fetching similarity:', {
            code: queryError.code,
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint
          })
          setError(true)
          return
        }

        // If no data (not yet calculated), this is OK - just don't show the card
        if (!data) {
          setLoading(false)
          return
        }

        if (data) {
          // @ts-ignore
          setSimilarity({
            // @ts-ignore
            score: Number(data.similarity_score),
            // @ts-ignore
            shared_categories: data.shared_categories || [],
            // @ts-ignore
            match_quality: getMatchQuality(Number(data.similarity_score))
          })
        }

        // Fetch shared experiences (where both users are witnesses)
        const { data: sharedExps } = await supabase
          .from('experiences')
          .select('id, title, category, created_at')
          .eq('visibility', 'public')
          .in('id',
            supabase.rpc('get_shared_experience_ids', {
              user1_id: currentUserId,
              user2_id: profileUserId
            })
          )
          .limit(10)
          .order('created_at', { ascending: false })

        // Fallback: Manual query if RPC doesn't exist yet
        if (!sharedExps) {
          // Query for experiences where both users appear as witnesses
          const { data: witnessData } = await supabase
            .from('experience_witnesses')
            .select('experience_id')

          // Find experience_ids that appear for both users
          const user1Witnesses = witnessData?.filter(w => w.user_id === currentUserId).map(w => w.experience_id) || []
          const user2Witnesses = witnessData?.filter(w => w.user_id === profileUserId).map(w => w.experience_id) || []
          const sharedIds = user1Witnesses.filter(id => user2Witnesses.includes(id))

          if (sharedIds.length > 0) {
            const { data: experiences } = await supabase
              .from('experiences')
              .select('id, title, category, created_at')
              .in('id', sharedIds)
              .eq('visibility', 'public')
              .limit(10)
              .order('created_at', { ascending: false })

            setSharedExperiences(experiences || [])
          }
        } else {
          setSharedExperiences(sharedExps || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarity()
  }, [profileUserId, currentUserId, isOwnProfile])

  // Don't render on own profile
  if (isOwnProfile) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Error or no similarity found
  if (error || !similarity) {
    return null // Silently hide if no match
  }

  // Only show if similarity is meaningful (>30%)
  if (similarity.score < 0.3) {
    return null
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressee_id: profileUserId,
          message: null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to create connection:', data.error)
        alert(data.error || 'Failed to create connection')
        return
      }

      alert('Connection request sent successfully!')
    } catch (err) {
      console.error('Error creating connection:', err)
      alert('Failed to send connection request')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <XPTwinsCard
      similarity={similarity}
      sharedExperiences={sharedExperiences}
      onConnect={handleConnect}
      isConnecting={isConnecting}
    />
  )
}
