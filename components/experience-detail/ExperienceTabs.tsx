'use client';

import { motion } from 'framer-motion';
import { BookOpen, Map, Clock, List, Network, User } from 'lucide-react';
import { getCategoryTheme } from '@/lib/config/category-themes';

export type ExperienceTabId = 'story' | 'map' | 'timeline' | 'list' | 'patterns' | 'you';

interface Tab {
  id: ExperienceTabId;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface ExperienceTabsProps {
  category: string;
  activeTab: ExperienceTabId;
  onTabChange: (tab: ExperienceTabId) => void;
  similarCount?: number;
  isAuthor?: boolean;
}

export function ExperienceTabs({
  category,
  activeTab,
  onTabChange,
  similarCount = 0,
  isAuthor = false,
}: ExperienceTabsProps) {
  const theme = getCategoryTheme(category);

  const tabs: Tab[] = [
    { id: 'story', label: 'Story', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'map', label: 'Map', icon: <Map className="h-5 w-5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-5 w-5" /> },
    { id: 'list', label: 'Similar', icon: <List className="h-5 w-5" />, count: similarCount },
    { id: 'patterns', label: 'Patterns', icon: <Network className="h-5 w-5" /> },
  ];

  // Only show "You" tab for author
  if (isAuthor) {
    tabs.push({ id: 'you', label: 'You', icon: <User className="h-5 w-5" /> });
  }

  return (
    <div className="relative">
      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto rounded-t-xl border-b border-white/10 bg-black/20 p-1 backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
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
                  layoutId="activeExperienceTab"
                  className={`absolute inset-0 -z-10 rounded-lg ${theme.glowColor}`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Indicator Line */}
      <div className={`h-0.5 ${theme.gradient}`} />
    </div>
  );
}
