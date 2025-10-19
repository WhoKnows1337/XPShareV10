'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  FileText,
  Lock,
  MessageSquare,
  Heart,
  Users,
  BarChart3,
  Trophy,
  Globe2,
  FileEdit,
  Sparkles,
} from 'lucide-react'

interface ProfileTab {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  requiresOwner?: boolean
}

const profileTabs: ProfileTab[] = [
  {
    id: 'experiences',
    label: 'Experiences',
    icon: <FileText className="h-4 w-4" />,
    description: 'Public experiences shared by this user',
  },
  {
    id: 'drafts',
    label: 'Drafts',
    icon: <FileEdit className="h-4 w-4" />,
    description: 'Saved drafts and work in progress',
    requiresOwner: true,
  },
  {
    id: 'private',
    label: 'Private',
    icon: <Lock className="h-4 w-4" />,
    description: 'Private experiences only visible to you',
    requiresOwner: true,
  },
  {
    id: 'comments',
    label: 'Comments',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Comments and interactions',
  },
  {
    id: 'liked',
    label: 'Liked',
    icon: <Heart className="h-4 w-4" />,
    description: 'Experiences this user has liked',
  },
  {
    id: 'collaborations',
    label: 'Collaborations',
    icon: <Users className="h-4 w-4" />,
    description: 'Collaborative experiences and witness contributions',
  },
  {
    id: 'xp-twins',
    label: 'XP Twins',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Find users with similar extraordinary experiences',
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: <Users className="h-4 w-4" />,
    description: 'XP Twins, Location, Patterns & Mutual connections',
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Analytics and insights',
  },
  {
    id: 'badges',
    label: 'Badges',
    icon: <Trophy className="h-4 w-4" />,
    description: 'Achievements and badges earned',
  },
  {
    id: 'impact',
    label: 'Global Impact',
    icon: <Globe2 className="h-4 w-4" />,
    description: 'Worldwide reach and pattern contributions',
  },
]

interface ProfileTabsProps {
  userId: string
  currentUserId?: string
  isOwnProfile: boolean
}

export function ProfileTabs({ userId, currentUserId, isOwnProfile }: ProfileTabsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'experiences'

  const buildTabUrl = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    return `${pathname}?${params.toString()}`
  }

  // Filter tabs based on whether user is viewing own profile
  const visibleTabs = profileTabs.filter((tab) => {
    if (tab.requiresOwner && !isOwnProfile) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-2">
      {/* Scrollable Tab List */}
      <div className="relative">
        <div
          role="tablist"
          className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          {visibleTabs.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <Link
                key={tab.id}
                href={buildTabUrl(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:pointer-events-none disabled:opacity-50',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.requiresOwner && (
                  <Lock className="h-3 w-3 opacity-50" aria-label="Private tab" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Tab Description */}
      <p className="text-xs text-muted-foreground text-center px-4">
        {visibleTabs.find((tab) => tab.id === currentTab)?.description}
      </p>
    </div>
  )
}
