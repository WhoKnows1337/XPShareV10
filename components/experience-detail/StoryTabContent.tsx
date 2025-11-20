import { ReactNode } from 'react';
import { ThreeColumnLayout } from '@/components/layout/three-column-layout';
import { MobileSwipeableCards } from '@/components/experience-canvas/MobileSwipeableCards';

interface StoryTabContentProps {
  contextRailContent: ReactNode;
  discoveryRailContent: ReactNode;
  mainContentArea: ReactNode;
  mobileSwipeableCardsData: Array<{ id: string; title: string; content: ReactNode }>;
}

export default function StoryTabContent({
  contextRailContent,
  discoveryRailContent,
  mainContentArea,
  mobileSwipeableCardsData,
}: StoryTabContentProps) {
  return (
    <>
      <div className="hidden lg:block">
        <ThreeColumnLayout
          leftSidebar={contextRailContent}
          mainContent={mainContentArea}
          rightPanel={discoveryRailContent}
        />
      </div>
      <div className="lg:hidden space-y-6">
        <div className="px-4">{mainContentArea}</div>
        <div className="px-2">
          <MobileSwipeableCards cards={mobileSwipeableCardsData} />
        </div>
      </div>
    </>
  );
}
