/**
 * XPShare AI - Rank Users Tool UI
 *
 * Displays top contributors with clickable profile links
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Target, Users } from 'lucide-react'
import Link from 'next/link'
import { ExportButton } from '@/components/discover/ExportButton'

interface RankUsersToolUIProps {
  toolResult: any
  title?: string
}

interface UserRanking {
  user_id: string
  username: string
  display_name: string
  experience_count: number
  category_diversity: number
  categories: string[]
}

export function RankUsersToolUI({ toolResult, title = 'Top Contributors' }: RankUsersToolUIProps) {
  // Extract result data (AI SDK v5 format)
  const result = toolResult.output || toolResult.result || {}
  const users: UserRanking[] = result.users || []
  const count = result.count || users.length
  const category = result.category

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No contributors found</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Medal emojis for top 3
  const getMedal = (rank: number) => {
    if (rank === 0) return '🥇'
    if (rank === 1) return '🥈'
    if (rank === 2) return '🥉'
    return null
  }

  // Get initials for avatar fallback
  const getInitials = (displayName: string) => {
    const parts = displayName.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return displayName.substring(0, 2).toUpperCase()
  }

  // Format category names for display
  const formatCategory = (cat: string) => {
    const categoryNames: Record<string, string> = {
      'ufo-uap': 'UFO/UAP',
      dreams: 'Dreams',
      'nde-obe': 'NDE/OBE',
      'paranormal-anomalies': 'Paranormal',
      synchronicity: 'Synchronicity',
      psychedelics: 'Psychedelics',
      'altered-states': 'Altered States',
      'ghosts-spirits': 'Ghosts/Spirits',
      'glitch-matrix': 'Glitch/Matrix',
      'nature-beings': 'Nature Beings',
    }
    return categoryNames[cat] || cat
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {category ? `Top ${count} contributors in ${formatCategory(category)}` : `Top ${count} contributors overall`}
              </CardDescription>
            </div>
          </div>
          <ExportButton data={users} filename="top-contributors" size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user, index) => (
            <Link
              key={user.user_id}
              href={`/profile/${user.username}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Rank & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-400 dark:text-gray-600 w-8 text-center">
                    {getMedal(index) || `#${index + 1}`}
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`/api/avatar/${user.user_id}`} alt={user.display_name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-base truncate">{user.display_name}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">{user.experience_count}</span>
                      <span>experiences</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{user.category_diversity}</span>
                      <span>categories</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {user.categories.slice(0, 5).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {formatCategory(cat)}
                      </Badge>
                    ))}
                    {user.categories.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.categories.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
