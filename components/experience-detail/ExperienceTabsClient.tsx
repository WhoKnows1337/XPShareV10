'use client';

import React, { useState } from 'react';
import { ExperienceTabs, ExperienceTabId } from './ExperienceTabs';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface ExperienceTabsClientProps {
  category: string;
  similarCount: number;
  isAuthor: boolean;
  children: React.ReactElement[];
}

export function ExperienceTabsClient({
  category,
  similarCount,
  isAuthor,
  children,
}: ExperienceTabsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get tab from URL or default to 'story'
  const tabParam = searchParams.get('tab') as ExperienceTabId | null;
  const [activeTab, setActiveTab] = useState<ExperienceTabId>(
    tabParam && ['story', 'map', 'timeline', 'list', 'patterns', 'you'].includes(tabParam)
      ? tabParam
      : 'story'
  );

  const handleTabChange = (tab: ExperienceTabId) => {
    setActiveTab(tab);

    // Update URL without reload
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Map tab IDs to child indices
  const tabIndexMap: Record<ExperienceTabId, number> = {
    story: 0,
    map: 1,
    timeline: 2,
    list: 3,
    patterns: 4,
    you: 5,
  };

  // Get current tab content from children array
  const currentTabContent = children[tabIndexMap[activeTab]] || children[0];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <ExperienceTabs
        category={category}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        similarCount={similarCount}
        isAuthor={isAuthor}
      />

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {currentTabContent}
      </div>
    </div>
  );
}
