'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XPTwinsList } from './xp-twins-card'
import { UserComparisonModal } from './user-comparison-modal'
import { Sparkles, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'

interface XPTwinsTabContentProps {
  userId: string
  isOwnProfile: boolean
}

/**
 * XP Twins Tab Content Component
 * Main content for the XP Twins tab on profile pages
 *
 * Features:
 * - Statistics overview
 * - List of XP Twins
 * - Connection management
 * - User comparison modal
 */
export function XPTwinsTabContent({ userId, isOwnProfile }: XPTwinsTabContentProps) {
  const [twins, setTwins] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch XP Twins
        const twinsResponse = await fetch('/api/similar-users?limit=10&minScore=30')
        if (!twinsResponse.ok) throw new Error('Failed to fetch twins')
        const twinsData = await twinsResponse.json()
        setTwins(twinsData.users || [])

        // Fetch stats (only for own profile)
        if (isOwnProfile) {
          const statsResponse = await fetch('/api/xp-twins/stats')
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
          }
        }
      } catch (error) {
        console.error('XP Twins fetch error:', error)
        toast.error('Failed to load XP Twins')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, isOwnProfile])

  const handleConnect = async (targetUserId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: targetUserId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to connect')
      }

      // Update the twin's connection status in local state
      setTwins(twins.map(twin =>
        twin.user_id === targetUserId
          ? { ...twin, connection_status: 'pending' }
          : twin
      ))

      toast.success('Connection request sent!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send connection request')
      throw error
    }
  }

  const handleViewComparison = (targetUserId: string) => {
    setSelectedUserId(targetUserId)
    setShowComparison(true)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Overview (Own Profile Only) */}
        {isOwnProfile && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total_potential_twins}</p>
                    <p className="text-sm text-muted-foreground">Potential Twins</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.high_match_count}</p>
                    <p className="text-sm text-muted-foreground">High Matches (≥70%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-50 rounded-full">
                    <Users className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(stats.average_similarity * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Similarity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* XP Twins List */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {isOwnProfile ? 'Your XP Twins' : 'Similar Users'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isOwnProfile
                ? 'Users with similar extraordinary experiences as you'
                : `Users with similar experiences to ${userId}`}
            </p>
          </div>

          <XPTwinsList
            twins={twins}
            isLoading={isLoading}
            onConnect={isOwnProfile ? handleConnect : undefined}
            onViewComparison={handleViewComparison}
            showBreakdown={true}
            emptyMessage={
              isOwnProfile
                ? 'No XP Twins found yet. Share more experiences to find your matches!'
                : 'No similar users found.'
            }
          />
        </div>
      </div>

      {/* User Comparison Modal */}
      <UserComparisonModal
        userId={selectedUserId}
        isOpen={showComparison}
        onClose={() => {
          setShowComparison(false)
          setSelectedUserId(null)
        }}
      />
    </>
  )
}
