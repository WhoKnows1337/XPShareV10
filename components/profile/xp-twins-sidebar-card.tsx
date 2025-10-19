'use client'

/**
 * XP Twins Sidebar Card
 *
 * Shows 3-5 most similar users to the viewed profile
 * Only displayed on OTHER users' profiles (not own profile)
 * Fetches from /api/users/[id]/similar
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

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

interface SimilarUser {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  similarity_score: number
  shared_categories: string[]
  total_xp: number
}

export function XPTwinsSidebarCard({
  profileUserId,
  currentUserId,
  isOwnProfile
}: XPTwinsSidebarCardProps) {
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Don't show on own profile
    if (isOwnProfile) {
      setLoading(false)
      return
    }

    async function fetchSimilarUsers() {
      try {
        const response = await fetch(`/api/users/${profileUserId}/similar?limit=5&minSimilarity=0.3`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()

        setSimilarUsers(data.similar_users || [])
      } catch (err) {
        console.error('Error fetching similar users:', err)
        setSimilarUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarUsers()
  }, [profileUserId, isOwnProfile])

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

  // No similar users found
  if (similarUsers.length === 0) {
    return null // Silently hide if no matches
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Similar Users
          </CardTitle>
          <Badge variant="secondary">{similarUsers.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* User List - Show up to 5 */}
        {similarUsers.slice(0, 5).map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors group"
            >
              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>
                  {(user.display_name || user.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user.display_name || user.username}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {Math.round(user.similarity_score * 100)}%
                    </span>
                  </div>
                  {user.shared_categories.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      · {user.shared_categories.length} categories
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow Icon */}
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          </motion.div>
        ))}

        {/* View All Link - Use first user's username to construct profile link, fallback to connections tab */}
        {similarUsers.length > 0 && (
          <Link href={`?tab=connections`}>
            <Button variant="outline" size="sm" className="w-full mt-2">
              <Users className="mr-2 h-4 w-4" />
              View All XP Twins
            </Button>
          </Link>
        )}

        {/* Description */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Users with similar experience profiles
        </p>
      </CardContent>
    </Card>
  )
}
