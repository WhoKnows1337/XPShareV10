'use client'

/**
 * Connections Tab Component
 *
 * Complete connections interface with 4 sub-tabs:
 * 1. XP Twins - Similar users by experience profile
 * 2. Location - Users from same geographic areas
 * 3. Patterns - Users who contributed to same patterns
 * 4. Mutual - Bidirectional connections/followers
 *
 * Features:
 * - Tab navigation
 * - Lazy loading of tab content
 * - Connect/Follow actions
 * - Search and filters
 */

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, MapPin, Sparkles, UserCheck, Search, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { ConnectionRequestsSection } from './connection-requests-section'

// Types
interface UserConnection {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  total_xp: number
  level: number
  isConnected?: boolean
  metadata?: {
    similarity?: number
    sharedCategories?: string[]
    sharedLocation?: string
    sharedPatterns?: string[]
    mutualConnections?: number
  }
}

interface ConnectionsTabProps {
  /**
   * Current user ID
   */
  userId: string

  /**
   * XP Twins data
   */
  xpTwins?: UserConnection[]

  /**
   * Location-based connections
   */
  locationConnections?: UserConnection[]

  /**
   * Pattern-based connections
   */
  patternConnections?: UserConnection[]

  /**
   * Mutual connections
   */
  mutualConnections?: UserConnection[]

  /**
   * Connect handler
   */
  onConnect?: (userId: string) => Promise<void>

  /**
   * View profile handler
   */
  onViewProfile?: (userId: string) => void
}

function UserCard({
  user,
  onConnect,
  onViewProfile,
  type
}: {
  user: UserConnection
  onConnect?: (userId: string) => Promise<void>
  onViewProfile?: (userId: string) => void
  type: 'xp-twin' | 'location' | 'pattern' | 'mutual'
}) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!onConnect) return
    setIsConnecting(true)
    try {
      await onConnect(user.id)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={user.avatar_url || ''} />
          <AvatarFallback>
            {(user.display_name || user.username || 'User')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">
                {user.display_name || user.username || 'Anonymous'}
              </h3>
              {user.username && (
                <p className="text-sm text-muted-foreground truncate">
                  @{user.username}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant="secondary" className="text-xs">
                Lvl {user.level}
              </Badge>
            </div>
          </div>

          {/* Type-specific metadata */}
          <div className="mt-2 space-y-1">
            {type === 'xp-twin' && user.metadata?.similarity && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">
                  {Math.round(user.metadata.similarity * 100)}% Similar
                </span>
                {user.metadata.sharedCategories && user.metadata.sharedCategories.length > 0 && (
                  <span className="text-muted-foreground">
                    · {user.metadata.sharedCategories.length} shared categories
                  </span>
                )}
              </div>
            )}

            {type === 'location' && user.metadata?.sharedLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{user.metadata.sharedLocation}</span>
              </div>
            )}

            {type === 'pattern' && user.metadata?.sharedPatterns && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{user.metadata.sharedPatterns.length} shared patterns</span>
              </div>
            )}

            {type === 'mutual' && user.metadata?.mutualConnections && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{user.metadata.mutualConnections} mutual connections</span>
              </div>
            )}
          </div>

          {/* Bio preview */}
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile?.(user.id)}
            >
              View Profile
            </Button>
            {!user.isConnected && onConnect && (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
            {user.isConnected && (
              <Badge variant="secondary">
                <UserCheck className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ConnectionsTab({
  userId,
  xpTwins = [],
  locationConnections = [],
  patternConnections = [],
  mutualConnections = [],
  onConnect,
  onViewProfile
}: ConnectionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filterUsers = (users: UserConnection[]) => {
    if (!searchQuery) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      u =>
        u.display_name?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.bio?.toLowerCase().includes(query)
    )
  }

  return (
    <>
      {/* Connection Requests Section - Only shown if there are pending incoming requests */}
      <ConnectionRequestsSection
        userId={userId}
        onRequestHandled={() => {
          // Could trigger a refresh of connections here if needed
        }}
      />

      <Tabs defaultValue="xp-twins" className="w-full">
        <div className="flex items-center gap-4 mb-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="xp-twins" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-2" />
            XP Twins
          </TabsTrigger>
          <TabsTrigger value="location" className="text-xs sm:text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </TabsTrigger>
          <TabsTrigger value="patterns" className="text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="mutual" className="text-xs sm:text-sm">
            <UserCheck className="h-4 w-4 mr-2" />
            Mutual
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search connections..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* XP Twins Tab */}
      <TabsContent value="xp-twins" className="space-y-4">
        {filterUsers(xpTwins).length > 0 ? (
          filterUsers(xpTwins).map(user => (
            <UserCard
              key={user.id}
              user={user}
              onConnect={onConnect}
              onViewProfile={onViewProfile}
              type="xp-twin"
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No XP twins found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Share more experiences to find similar users
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Location Tab */}
      <TabsContent value="location" className="space-y-4">
        {filterUsers(locationConnections).length > 0 ? (
          filterUsers(locationConnections).map(user => (
            <UserCard
              key={user.id}
              user={user}
              onConnect={onConnect}
              onViewProfile={onViewProfile}
              type="location"
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No location-based connections</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add location data to your experiences
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Patterns Tab */}
      <TabsContent value="patterns" className="space-y-4">
        {filterUsers(patternConnections).length > 0 ? (
          filterUsers(patternConnections).map(user => (
            <UserCard
              key={user.id}
              user={user}
              onConnect={onConnect}
              onViewProfile={onViewProfile}
              type="pattern"
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No pattern connections</p>
              <p className="text-xs text-muted-foreground mt-1">
                Explore patterns to find contributors
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Mutual Tab */}
      <TabsContent value="mutual" className="space-y-4">
        {filterUsers(mutualConnections).length > 0 ? (
          filterUsers(mutualConnections).map(user => (
            <UserCard
              key={user.id}
              user={user}
              onConnect={onConnect}
              onViewProfile={onViewProfile}
              type="mutual"
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No mutual connections yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start connecting with other users
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      </Tabs>
    </>
  )
}
