'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Sparkles, Users, TrendingUp, Trophy } from 'lucide-react'

interface FeedTab {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

const feedTabs: FeedTab[] = [
  {
    id: 'for-you',
    label: 'For You',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'AI-personalized experiences based on your interests',
  },
  {
    id: 'following',
    label: 'Following',
    icon: <Users className="h-4 w-4" />,
    description: 'Experiences from users you follow',
  },
  {
    id: 'trending',
    label: 'Trending',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Viral experiences with high engagement',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: <Trophy className="h-4 w-4" />,
    description: 'Community badges, level-ups, and streaks',
  },
]

export function FeedTabs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'for-you'

  const buildTabUrl = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="space-y-2">
      <div
        role="tablist"
        className="inline-flex h-auto w-full items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      >
        <div className="grid w-full grid-cols-4 gap-1">
          {feedTabs.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <Link
                key={tab.id}
                href={buildTabUrl(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'inline-flex flex-col items-center justify-center gap-1 rounded-md px-3 py-3 text-sm font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:pointer-events-none disabled:opacity-50',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="flex items-center gap-1.5">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {feedTabs.find((tab) => tab.id === currentTab)?.description}
      </p>
    </div>
  )
}
