'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, MessageCircle, Award, MapPin, Calendar, Network, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { ImpactTab } from './ImpactTab';
import { MatchExplanation, type MatchReason } from './MatchExplanation';
import { TimelineChart } from './TimelineChart';
import { CorrelationMatrix } from './CorrelationMatrix';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

// Lazy load map component for better performance - using dynamic import ONLY (no static import)
const GeographicHeatmapLazy = dynamic(
  () => import('./GeographicHeatmap').then((mod) => mod.GeographicHeatmap),
  {
    loading: () => <div className="h-[400px] flex items-center justify-center"><Skeleton className="h-full w-full" /></div>,
    ssr: false
  }
);

interface SimilarExperience {
  id: string;
  title: string;
  category: string;
  created_at: string;
  user_profiles?: {
    username: string;
    display_name?: string;
  };
  match_score?: number;
  match_reasons?: MatchReason[];
}

interface BentoTabsProps {
  similarExperiences: SimilarExperience[];
  patternData?: {
    geographic?: { count: number; total: number; location: string };
    temporal?: { count: number; total: number; period: string };
    category?: { count: number; total: number; name: string };
  };
  commentsPreview?: Array<{
    id: string;
    user: string;
    text: string;
    created_at: string;
  }>;
  experienceId: string;
}

const categoryIcons: Record<string, string> = {
  ufo: '🛸',
  paranormal: '👻',
  dreams: '💭',
  psychedelic: '🌈',
  spiritual: '✨',
  synchronicity: '🔄',
  nde: '💫',
  other: '❓',
};

export function BentoTabs({
  similarExperiences,
  patternData,
  commentsPreview = [],
  experienceId,
}: BentoTabsProps) {
  const [activeTab, setActiveTab] = useState<'similar' | 'patterns' | 'impact' | 'discuss'>('similar');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [patternsView, setPatternsView] = useState<'overview' | 'geographic' | 'temporal' | 'attributes'>('overview');

  // ✅ PHASE 4: Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', experienceId],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${experienceId}/patterns/analytics`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: activeTab === 'patterns', // Only fetch when patterns tab is active
  });

  const tabs = [
    { id: 'similar' as const, label: 'Similar', icon: Sparkles, count: similarExperiences.length },
    { id: 'patterns' as const, label: 'Patterns', icon: TrendingUp, count: patternData ? 3 : 0 },
    { id: 'impact' as const, label: 'Impact', icon: Award, count: 0 },
    { id: 'discuss' as const, label: 'Discuss', icon: MessageCircle, count: commentsPreview.length },
  ];

  return (
    <div className="space-y-3">
      {/* Tab Buttons */}
      <div className="flex gap-2 p-1 glass-card">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <span className="relative flex items-center justify-center gap-1.5">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="text-xs opacity-60">({tab.count})</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="glass-card p-4"
      >
        {activeTab === 'similar' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Similar Experiences</h3>
              <span className="text-xs text-muted-foreground">{similarExperiences.length} found</span>
            </div>

            {/* Horizontal Scroll Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {similarExperiences.slice(0, 8).map((exp) => {
                // Generate match reasons if not provided
                const matchReasons: MatchReason[] = exp.match_reasons || [
                  { type: 'category', label: 'Same category', confidence: 95, details: exp.category },
                  { type: 'keywords', label: 'Shared keywords', confidence: 82 },
                  { type: 'location', label: 'Similar location', confidence: 75, details: 'Within 50km' },
                ];

                return (
                  <div key={exp.id} className="flex-shrink-0 w-48 space-y-1">
                    <Link
                      href={`/experiences/${exp.id}`}
                      className="block glass-card p-3 hover:scale-105 transition-transform"
                    >
                      <div className="space-y-2">
                        {/* Match Score */}
                        {exp.match_score && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Match</span>
                            <span className="text-sm font-semibold text-primary">
                              {exp.match_score}%
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <p className="text-sm font-medium line-clamp-2">
                          {exp.title}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{categoryIcons[exp.category] || '📍'}</span>
                          <span className="truncate">
                            {exp.user_profiles?.display_name || exp.user_profiles?.username}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {exp.match_score && (
                          <div className="h-1 bg-space-light rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${exp.match_score}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* ✅ PHASE 3: Match Explanation */}
                    {exp.match_score && (
                      <MatchExplanation
                        reasons={matchReasons}
                        overallScore={exp.match_score}
                        isExpanded={expandedMatchId === exp.id}
                        onToggle={() => setExpandedMatchId(expandedMatchId === exp.id ? null : exp.id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {similarExperiences.length > 8 && (
              <p className="text-center text-sm text-muted-foreground">
                Showing 8 of {similarExperiences.length} similar experiences
              </p>
            )}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {/* ✅ PHASE 4: View Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'overview' as const, label: 'Overview', icon: LayoutGrid },
                { id: 'geographic' as const, label: 'Geographic', icon: MapPin },
                { id: 'temporal' as const, label: 'Temporal', icon: Calendar },
                { id: 'attributes' as const, label: 'Attributes', icon: Network },
              ].map((view) => {
                const Icon = view.icon;
                const isActive = patternsView === view.id;

                return (
                  <button
                    key={view.id}
                    onClick={() => setPatternsView(view.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{view.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ✅ PHASE 4: Analytics Content */}
            {analyticsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : analyticsData ? (
              <>
                {patternsView === 'overview' && patternData && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Pattern Analysis Overview</h3>

                    {/* Geographic */}
                    {patternData.geographic && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">📍 Geographic</span>
                          <span className="font-semibold">
                            {patternData.geographic.count}/{patternData.geographic.total} in {patternData.geographic.location}
                          </span>
                        </div>
                        <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-observatory-gold transition-all"
                            style={{
                              width: `${(patternData.geographic.count / patternData.geographic.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Temporal */}
                    {patternData.temporal && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">🕐 Temporal</span>
                          <span className="font-semibold">
                            {patternData.temporal.count}/{patternData.temporal.total} {patternData.temporal.period}
                          </span>
                        </div>
                        <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 transition-all"
                            style={{
                              width: `${(patternData.temporal.count / patternData.temporal.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {patternData.category && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">🏷️ Category</span>
                          <span className="font-semibold">
                            {patternData.category.count}/{patternData.category.total} &quot;{patternData.category.name}&quot;
                          </span>
                        </div>
                        <div className="h-1.5 bg-space-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success-soft transition-all"
                            style={{
                              width: `${(patternData.category.count / patternData.category.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {patternsView === 'geographic' && (
                  <GeographicHeatmapLazy
                    clusters={analyticsData.geographic_analysis?.clusters || []}
                    currentExperience={
                      analyticsData.geographic_analysis?.clusters?.[0]?.is_current
                        ? {
                            lat: analyticsData.geographic_analysis.clusters[0].center_lat,
                            lng: analyticsData.geographic_analysis.clusters[0].center_lng,
                          }
                        : undefined
                    }
                  />
                )}

                {patternsView === 'temporal' && (
                  <TimelineChart
                    data={analyticsData.temporal_analysis?.timeline || []}
                    spikes={analyticsData.temporal_analysis?.spikes || []}
                    currentExperienceDate={analyticsData.temporal_analysis?.current_experience_date || ''}
                  />
                )}

                {patternsView === 'attributes' && (
                  <CorrelationMatrix
                    correlations={analyticsData.attribute_analysis?.correlations || []}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No pattern data available
              </div>
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <ImpactTab experienceId={experienceId} />
        )}

        {activeTab === 'discuss' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Discussion</h3>
              <span className="text-xs text-muted-foreground">{commentsPreview.length} comments</span>
            </div>

            {commentsPreview.length > 0 ? (
              <div className="space-y-2">
                {commentsPreview.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="p-2 glass-card text-sm">
                    <p className="font-medium">{comment.user}</p>
                    <p className="text-muted-foreground line-clamp-2">{comment.text}</p>
                  </div>
                ))}
                <Link
                  href={`/experiences/${experienceId}#comments`}
                  className="block text-center text-sm text-primary hover:underline"
                >
                  View all comments →
                </Link>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No comments yet. Be the first to discuss!
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
