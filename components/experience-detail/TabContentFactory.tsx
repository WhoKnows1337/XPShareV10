import { ReactNode, lazy, Suspense } from 'react';
import { ThreeColumnLayout } from '@/components/layout/three-column-layout';
import { MobileSwipeableCards } from '@/components/experience-canvas/MobileSwipeableCards';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedListTab } from './EnhancedListTab';
import { Badge } from '@/components/ui/badge';

interface TabContentProps {
  // Sidebar content
  contextRailContent: ReactNode;
  discoveryRailContent: ReactNode;
  patternSidebarContent: ReactNode;
  mainContentArea: ReactNode;
  mobileSwipeableCardsData: Array<{ id: string; title: string; content: ReactNode }>;

  // Data for tabs
  similarExpsData: any[];
  experience: any;
  categoryMatches: number;
  locationMatches: number;
  temporalMatches: number;
  patternStrength: number;
  hasActiveWave: boolean;
  nearbyCount: number;
  userData: any;
  categoryLabel: string;
}

export function createTabContent(props: TabContentProps) {
  const {
    contextRailContent,
    discoveryRailContent,
    patternSidebarContent,
    mainContentArea,
    mobileSwipeableCardsData,
    similarExpsData,
    experience,
    categoryMatches,
    locationMatches,
    temporalMatches,
    patternStrength,
    hasActiveWave,
    nearbyCount,
    userData,
    categoryLabel,
  } = props;

  // Tab: Story (Default view)
  const storyTabContent = (
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

  // Tab: Map
  const mapTabContent = (
    <div className="container mx-auto px-4">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Geographic View</h3>
          {experience.location_lat && experience.location_lng ? (
            <div className="space-y-4">
              <div className="aspect-square w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Map visualization: {experience.location_text}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <p className="text-sm font-mono">{experience.location_lat.toFixed(6)}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="text-sm font-mono">{experience.location_lng.toFixed(6)}</p>
                </div>
              </div>
              {nearbyCount > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  {nearbyCount} nearby experiences in this area
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No location data available for this experience.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Tab: Timeline
  const timelineTabContent = (
    <div className="container mx-auto px-4">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Timeline View</h3>
          <p className="text-muted-foreground text-center py-8">Timeline visualization coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );

  // Tab: List (Enhanced with filters)
  const listTabContent = (
    <EnhancedListTab
      experiences={similarExpsData.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        similarity_score: exp.similarity_score,
        location_text: exp.location_text,
        time_of_day: exp.time_of_day,
        created_at: exp.created_at,
        user_profiles: exp.user_profiles,
      }))}
      currentCategory={experience.category}
      currentLocation={experience.location_text ?? undefined}
      currentTimeOfDay={experience.time_of_day ?? undefined}
    />
  );

  // Tab: Patterns
  const patternsTabContent = (
    <div className="container mx-auto px-4">
      <div className="space-y-6">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pattern Analysis</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Pattern Strength</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${patternStrength}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold">{patternStrength}%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold">{categoryMatches}</p>
                  <p className="text-xs text-muted-foreground">Category</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold">{locationMatches}</p>
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold">{temporalMatches}</p>
                  <p className="text-xs text-muted-foreground">Temporal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {patternSidebarContent}
      </div>
    </div>
  );

  // Tab: You (Author only)
  const youTabContent = (
    <div className="container mx-auto px-4">
      <Card className="glass-card border-yellow-500/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Impact</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{experience.view_count || 0}</p>
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{experience.upvote_count || 0}</p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{experience.comment_count || 0}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{similarExpsData.length}</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
            </div>
            {userData.topBadges && userData.topBadges.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Top Badges</p>
                <div className="flex gap-3">
                  {userData.topBadges.map((badge: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl mb-1">{badge.icon}</div>
                      <p className="text-xs text-muted-foreground">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return {
    storyTabContent,
    mapTabContent,
    timelineTabContent,
    listTabContent,
    patternsTabContent,
    youTabContent,
  };
}
