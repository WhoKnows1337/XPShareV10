'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { XPDNABadge } from './xp-dna-badge'
import { Sparkles, TrendingUp, MapPin, Calendar, Award } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

interface UserComparisonData {
  similarity: {
    score: number
    breakdown: {
      category_overlap: number
      distribution: number
      location: number
      temporal: number
      experience_overlap: number
      pattern: number
    }
  }
  users: {
    user1: UserProfile
    user2: UserProfile
  }
  shared: {
    categories: string[]
    category_count: number
    experience_count: number
  }
  connection: {
    status: string
    created_at?: string
    direction?: string
  }
}

interface UserProfile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  total_xp: number
  level: number
  total_experiences: number
  top_categories: string[]
  category_distribution: Record<string, number>
}

interface UserComparisonModalProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

/**
 * User Comparison Modal Component
 * Detailed side-by-side comparison of two users
 *
 * Features from profil.md:
 * - Similarity breakdown with radar chart
 * - Side-by-side profile comparison
 * - Shared categories visualization
 * - XP DNA comparison
 */
export function UserComparisonModal({
  userId,
  isOpen,
  onClose
}: UserComparisonModalProps) {
  const [data, setData] = useState<UserComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!userId || !isOpen) {
      setData(null)
      return
    }

    const fetchComparison = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/xp-twins/compare/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch comparison')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Comparison fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComparison()
  }, [userId, isOpen])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatCategory = (cat: string) => {
    return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  // Prepare radar chart data
  const radarData = data ? [
    {
      factor: 'Category\nOverlap',
      value: Math.round(data.similarity.breakdown.category_overlap * 100),
      fullMark: 100
    },
    {
      factor: 'Distribution',
      value: Math.round(data.similarity.breakdown.distribution * 100),
      fullMark: 100
    },
    {
      factor: 'Location',
      value: Math.round(data.similarity.breakdown.location * 100),
      fullMark: 100
    },
    {
      factor: 'Temporal',
      value: Math.round(data.similarity.breakdown.temporal * 100),
      fullMark: 100
    },
    {
      factor: 'Experience\nOverlap',
      value: Math.round(data.similarity.breakdown.experience_overlap * 100),
      fullMark: 100
    },
  ] : []

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            XP Twin Comparison
          </DialogTitle>
          <DialogDescription>
            Detailed similarity analysis and profile comparison
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Similarity Score Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
              <div className="text-center mb-4">
                <h3 className="text-4xl font-bold text-purple-600">
                  {Math.round(data.similarity.score * 100)}% MATCH
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Overall Similarity Score
                </p>
              </div>
              <Progress
                value={data.similarity.score * 100}
                className="h-3"
                indicatorClassName="bg-gradient-to-r from-purple-600 to-blue-600"
              />
            </div>

            {/* Side-by-Side Profiles */}
            <div className="grid grid-cols-2 gap-4">
              {/* User 1 (Current User) */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={data.users.user1.avatar_url || undefined}
                      alt={data.users.user1.username}
                    />
                    <AvatarFallback>
                      {getInitials(data.users.user1.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{data.users.user1.display_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{data.users.user1.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span>Level {data.users.user1.level}</span>
                    <span className="text-muted-foreground">({data.users.user1.total_xp} XP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>{data.users.user1.total_experiences} experiences</span>
                  </div>
                </div>

                <XPDNABadge
                  topCategories={data.users.user1.top_categories}
                  categoryDistribution={data.users.user1.category_distribution}
                  size="md"
                />
              </div>

              {/* User 2 (Comparison Target) */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={data.users.user2.avatar_url || undefined}
                      alt={data.users.user2.username}
                    />
                    <AvatarFallback>
                      {getInitials(data.users.user2.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{data.users.user2.display_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{data.users.user2.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span>Level {data.users.user2.level}</span>
                    <span className="text-muted-foreground">({data.users.user2.total_xp} XP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>{data.users.user2.total_experiences} experiences</span>
                  </div>
                </div>

                <XPDNABadge
                  topCategories={data.users.user2.top_categories}
                  categoryDistribution={data.users.user2.category_distribution}
                  size="md"
                />
              </div>
            </div>

            {/* Shared Categories */}
            {data.shared.categories.length > 0 && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Shared Interests ({data.shared.category_count})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.shared.categories.map(cat => (
                    <Badge key={cat} variant="secondary">
                      {formatCategory(cat)}
                    </Badge>
                  ))}
                </div>
                {data.shared.experience_count > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.shared.experience_count} shared experiences
                  </p>
                )}
              </div>
            )}

            {/* Similarity Breakdown Radar Chart */}
            <div>
              <h4 className="font-semibold mb-3">Similarity Breakdown</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="factor"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Radar
                      name="Similarity"
                      dataKey="value"
                      stroke="#7C3AED"
                      fill="#7C3AED"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Detailed Breakdown List */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {Object.entries(data.similarity.breakdown).map(([factor, score]) => {
                    if (factor === 'pattern' && score === 0) return null
                    return (
                      <div key={factor} className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground capitalize flex-1">
                          {factor.replace('_', ' ')}
                        </span>
                        <span className="font-medium">
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Connection Status */}
            {data.connection.status !== 'none' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  Connection Status: {data.connection.status}
                </p>
                {data.connection.direction && (
                  <p className="text-xs text-blue-700 mt-1">
                    Direction: {data.connection.direction}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load comparison data
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
