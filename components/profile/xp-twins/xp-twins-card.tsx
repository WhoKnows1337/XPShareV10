'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UserPlus, Check, X, Clock, Shield, Sparkles } from 'lucide-react'
import { XPDNABadge } from './xp-dna-badge'
import { toast } from 'sonner'

interface XPTwin {
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  similarity_score: number // 0-100
  common_categories: string[]
  connection_status: 'none' | 'pending' | 'accepted' | 'rejected' | 'blocked'
  total_xp: number
  top_categories: string[]
  similarity_breakdown?: {
    category_overlap: number
    distribution: number
    location: number
    temporal: number
    experience_overlap: number
    pattern: number
  }
}

interface XPTwinsCardProps {
  twin: XPTwin
  onConnect?: (userId: string) => Promise<void>
  onViewComparison?: (userId: string) => void
  showBreakdown?: boolean
}

/**
 * XP Twins Card Component
 * Displays a similar user with similarity score and connection options
 *
 * Features from profil.md:
 * - "87% MATCH WITH YOU!" display
 * - Similarity breakdown visualization
 * - Connect button with status
 * - XP DNA badge integration
 */
export function XPTwinsCard({
  twin,
  onConnect,
  onViewComparison,
  showBreakdown = false
}: XPTwinsCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!onConnect) return

    setIsConnecting(true)
    try {
      await onConnect(twin.user_id)
      toast.success('Connection request sent!')
    } catch (error) {
      toast.error('Failed to send connection request')
      console.error('Connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Get similarity level and color
  const getSimilarityLevel = (score: number) => {
    if (score >= 70) return { label: 'XP TWIN!', color: 'text-purple-600', bg: 'bg-purple-50' }
    if (score >= 50) return { label: 'HIGH MATCH', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 30) return { label: 'SIMILAR', color: 'text-cyan-600', bg: 'bg-cyan-50' }
    return { label: 'COMPATIBLE', color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  const level = getSimilarityLevel(twin.similarity_score)

  // Connection button rendering
  const renderConnectionButton = () => {
    switch (twin.connection_status) {
      case 'accepted':
        return (
          <Badge variant="secondary" className="gap-1">
            <Check className="h-3 w-3" />
            Connected
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case 'rejected':
      case 'blocked':
        return (
          <Badge variant="outline" className="gap-1 opacity-50">
            <Shield className="h-3 w-3" />
            Not Available
          </Badge>
        )
      default:
        return (
          <Button
            size="sm"
            onClick={handleConnect}
            disabled={isConnecting}
            className="gap-1"
          >
            <UserPlus className="h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        )
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="hover-lift transition-all duration-300 group">
      <CardHeader className="pb-3">
        {/* Similarity Score Header */}
        <div className={`${level.bg} -mx-6 -mt-6 px-6 pt-4 pb-3 rounded-t-lg border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-5 w-5 ${level.color}`} />
              <CardTitle className={`text-2xl font-bold ${level.color}`}>
                {Math.round(twin.similarity_score)}% {level.label}
              </CardTitle>
            </div>
            <XPDNABadge
              topCategories={twin.top_categories}
              size="sm"
              showLabel={false}
            />
          </div>
          <Progress
            value={twin.similarity_score}
            className="h-2 mt-2"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={twin.avatar_url || undefined} alt={twin.username} />
            <AvatarFallback>{getInitials(twin.display_name || twin.username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{twin.display_name || twin.username}</p>
            <p className="text-sm text-muted-foreground truncate">@{twin.username}</p>
          </div>
          {renderConnectionButton()}
        </div>

        {/* Shared Categories */}
        {twin.common_categories && twin.common_categories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Shared Interests ({twin.common_categories.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {twin.common_categories.map(cat => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Similarity Breakdown (optional) */}
        {showBreakdown && twin.similarity_breakdown && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">Similarity Breakdown</p>
            {Object.entries(twin.similarity_breakdown).map(([factor, score]) => {
              if (factor === 'pattern' && score === 0) return null // Hide unused pattern factor
              return (
                <div key={factor} className="flex items-center gap-2 text-xs">
                  <span className="w-24 text-muted-foreground capitalize">
                    {factor.replace('_', ' ')}
                  </span>
                  <Progress value={score * 100} className="h-1 flex-1" />
                  <span className="w-8 text-right font-medium">
                    {Math.round(score * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(`/profile/${twin.user_id}`, '_blank')}
          >
            View Profile
          </Button>
          {onViewComparison && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewComparison(twin.user_id)}
            >
              Compare
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * XP Twins List Component
 * Displays a list of XP Twins
 */
interface XPTwinsListProps {
  twins: XPTwin[]
  isLoading?: boolean
  onConnect?: (userId: string) => Promise<void>
  onViewComparison?: (userId: string) => void
  showBreakdown?: boolean
  emptyMessage?: string
}

export function XPTwinsList({
  twins,
  isLoading = false,
  onConnect,
  onViewComparison,
  showBreakdown = false,
  emptyMessage = 'No XP Twins found. Share more experiences to find your matches!'
}: XPTwinsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-12 bg-muted rounded" />
                <div className="h-6 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (twins.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {twins.map(twin => (
        <XPTwinsCard
          key={twin.user_id}
          twin={twin}
          onConnect={onConnect}
          onViewComparison={onViewComparison}
          showBreakdown={showBreakdown}
        />
      ))}
    </div>
  )
}
