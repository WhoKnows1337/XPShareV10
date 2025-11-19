'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, Clock, List, Network, User } from 'lucide-react'
import { getCategoryTheme } from '@/lib/config/category-themes'

export type TabId = 'map' | 'timeline' | 'list' | 'patterns' | 'you'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  count?: number
}

interface SuccessTabsProps {
  category: string
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  tabs?: Tab[]
  similarCount?: number
}

export function SuccessTabs({
  category,
  activeTab,
  onTabChange,
  tabs,
  similarCount = 0,
}: SuccessTabsProps) {
  const theme = getCategoryTheme(category)

  const defaultTabs: Tab[] = [
    { id: 'map', label: 'Map', icon: <Map className="h-5 w-5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-5 w-5" /> },
    { id: 'list', label: 'List', icon: <List className="h-5 w-5" />, count: similarCount },
    { id: 'patterns', label: 'Patterns', icon: <Network className="h-5 w-5" /> },
    { id: 'you', label: 'You', icon: <User className="h-5 w-5" /> },
  ]

  const tabsToRender = tabs || defaultTabs

  return (
    <div className="relative">
      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto rounded-t-xl border-b border-white/10 bg-black/20 p-1 backdrop-blur-sm">
        {tabsToRender.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
                ${
                  isActive
                    ? `${theme.accentColor} bg-white/10`
                    : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                }
              `}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`
                    ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold
                    ${isActive ? 'bg-white/20' : 'bg-white/10'}
                  `}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 -z-10 rounded-lg ${theme.glowColor}`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Active Tab Indicator Line */}
      <div className={`h-0.5 ${theme.gradient}`} />
    </div>
  )
}
