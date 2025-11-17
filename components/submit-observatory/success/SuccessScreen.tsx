'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { CheckCircle, ArrowRight, Share2, Plus, Sparkles, Users, TrendingUp, Globe } from 'lucide-react';
import { SimilarExperiencesSection } from './SimilarExperiencesSection';
import { RewardsSection } from './RewardsSection';
import { DiscoveryLoadingScreen } from './DiscoveryLoadingScreen';
import { WaveAlertCard } from './WaveAlertCard';
import { CorrelationCard } from './CorrelationCard';
import { TemporalPatternCard } from './TemporalPatternCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PublishResult {
  experienceId: string;
  xpEarned: number;
  badgesEarned: string[];
  leveledUp: boolean;
  newLevel?: number;
}

interface PatternInsight {
  type: 'wave' | 'solar' | 'lunar' | 'seismic' | 'temporal';
  data: any;
}

interface DiscoveryStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  icon: typeof Users;
  count?: number;
  insights?: number;
  correlations?: number;
}

export function SuccessScreen() {
  const t = useTranslations('submit.success');
  const router = useRouter();
  const { screen1, screen2, screen3, screen4, reset, publishResult } = useSubmitFlowStore();

  const [error, setError] = useState<string | null>(null);

  // Pattern discovery states
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverySteps, setDiscoverySteps] = useState<DiscoveryStep[]>([]);
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([]);
  const [similarCount, setSimilarCount] = useState(0);

  useEffect(() => {
    if (publishResult) {
      handlePatternDiscovery(publishResult.experienceId);
    }
  }, [publishResult]);

  const handlePatternDiscovery = async (experienceId: string) => {
    setIsDiscovering(true);

    // Initialize discovery steps
    const steps: DiscoveryStep[] = [
      {
        id: 'similar',
        label: t('discovery.findingSimilar'),
        status: 'active',
        icon: Users,
      },
      {
        id: 'patterns',
        label: t('discovery.detectingPatterns'),
        status: 'pending',
        icon: TrendingUp,
      },
      {
        id: 'events',
        label: t('discovery.checkingEvents'),
        status: 'pending',
        icon: Globe,
      },
    ];
    setDiscoverySteps(steps);

    const insights: PatternInsight[] = [];

    try {
      // Step 1: Find Similar Experiences
      const similarResponse = await fetch(
        `/api/submit/find-similar?experienceId=${encodeURIComponent(experienceId)}`
      );

      if (similarResponse.ok) {
        const similarData = await similarResponse.json();
        const similar = similarData.similar || [];
        setSimilarCount(similar.length);
        setDiscoverySteps(prev => prev.map(s =>
          s.id === 'similar'
            ? { ...s, status: 'completed', count: similar.length }
            : s.id === 'patterns'
            ? { ...s, status: 'active' }
            : s
        ));
      } else {
        console.warn('Failed to find similar experiences:', await similarResponse.text());
      }

      // Step 2: Pattern Analysis
      const patternsResponse = await fetch(`/api/patterns/for-experience/${experienceId}`);
      let patternCorrelations: Record<string, { strength: number; description: string }> = {};
      
      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json();

        // Store correlations for later use
        if (patternsData.insights?.correlations) {
          patternCorrelations = patternsData.insights.correlations;
        }

        // Extract insights
        if (patternsData.insights?.geographic?.length > 0) {
          const cluster = patternsData.insights.geographic[0];
          insights.push({
            type: 'wave',
            data: {
              count: cluster.count,
              location: cluster.attribute || screen2.location,
              timeframe: '30 days',
              trend: 200,
            },
          });
        }

        if (patternsData.insights?.temporal?.length > 0) {
          const temporal = patternsData.insights.temporal[0];
          insights.push({
            type: 'temporal',
            data: {
              period: temporal.timeOfDay || temporal.dayOfWeek || temporal.season,
              count: temporal.count,
              trend: temporal.percentage || 300,
              comparison: 'vs. previous month',
            },
          });
        }

        setDiscoverySteps(prev => prev.map(s =>
          s.id === 'patterns'
            ? { ...s, status: 'completed', insights: insights.length }
            : s.id === 'events'
            ? { ...s, status: 'active' }
            : s
        ));
      }

      // Step 3: External Events (Advanced Pattern Matching)
      const eventsResponse = await fetch('/api/ai/pattern-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          text: screen1.text,
          category: screen2.category,
          date: screen2.date,
          location: screen2.location,
          lat: screen2.locationLat,
          lng: screen2.locationLng,
        }),
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        let correlationCount = 0;

        // Solar Activity
        const solarEvents = eventsData.externalEvents?.filter((e: any) => e.type === 'solar') || [];
        if (solarEvents.length > 0) {
          const solar = solarEvents[0];
          
          // Calculate percentage from relevance (0-1 scale to percentage)
          // Or use correlation data from pattern analysis if available
          let percentage = Math.round(solar.relevance * 100);
          
          // Check if we have historical correlation data
          const solarCorrelation = Object.values(patternCorrelations).find((corr: any) => 
            corr.description?.toLowerCase().includes('solar') || 
            corr.description?.toLowerCase().includes('kp')
          );
          if (solarCorrelation) {
            percentage = Math.round(solarCorrelation.strength * 100);
          }

          insights.push({
            type: 'solar',
            data: {
              kpIndex: solar.data?.flux ? Math.min(9, Math.round(solar.data.flux * 1e5)) : 6,
              date: solar.timestamp,
              percentage,
            },
          });
          correlationCount++;
        }

        // Moon Phase
        const moonEvents = eventsData.externalEvents?.filter((e: any) => e.type === 'moon') || [];
        if (moonEvents.length > 0) {
          const moon = moonEvents[0];
          
          // Calculate percentage from relevance
          let percentage = Math.round(moon.relevance * 100);
          
          // Check if we have historical correlation data
          const lunarCorrelation = Object.values(patternCorrelations).find((corr: any) => 
            corr.description?.toLowerCase().includes('moon') || 
            corr.description?.toLowerCase().includes('lunar')
          );
          if (lunarCorrelation) {
            percentage = Math.round(lunarCorrelation.strength * 100);
          }

          insights.push({
            type: 'lunar',
            data: {
              phase: moon.data?.phase || moon.title,
              illumination: moon.data?.illumination || 0.9,
              percentage,
            },
          });
          correlationCount++;
        }

        // Seismic Activity
        const earthquakes = eventsData.externalEvents?.filter((e: any) => e.type === 'earthquake') || [];
        if (earthquakes.length > 0) {
          const quake = earthquakes[0];
          
          // Calculate percentage from relevance
          let percentage = Math.round(quake.relevance * 100);
          
          // Check if we have historical correlation data
          const seismicCorrelation = Object.values(patternCorrelations).find((corr: any) => 
            corr.description?.toLowerCase().includes('earthquake') || 
            corr.description?.toLowerCase().includes('seismic')
          );
          if (seismicCorrelation) {
            percentage = Math.round(seismicCorrelation.strength * 100);
          }

          // Calculate distance and time from event data
          const distance = quake.data?.properties?.place ? 
            parseInt(quake.data.properties.place.match(/\d+/)?.[0] || '50') : 50;
          
          const eventTime = new Date(quake.timestamp);
          const experienceTime = new Date(screen2.date || Date.now());
          const hoursDiff = Math.abs(experienceTime.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
          const time = hoursDiff < 24 ? 
            `${Math.round(hoursDiff)} hours` : 
            `${Math.round(hoursDiff / 24)} days`;

          insights.push({
            type: 'seismic',
            data: {
              magnitude: quake.data?.properties?.mag || 5.0,
              distance,
              time,
              percentage,
            },
          });
          correlationCount++;
        }

        setDiscoverySteps(prev => prev.map(s =>
          s.id === 'events'
            ? { ...s, status: 'completed', correlations: correlationCount }
            : s
        ));
      }

      setPatternInsights(insights);
    } catch (err) {
      console.error('Pattern discovery error:', err);

      // Show error toast to user
      toast.error(t('discovery.error'), {
        description: t('discovery.errorDesc'),
        duration: 5000,
      });

      // Mark all as completed to show results screen
      setDiscoverySteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
    } finally {
      setIsDiscovering(false);
    }
  };;

  const handleSubmitAnother = () => {
    reset();
    router.push('/submit');
  };

  // Show pattern discovery loading
  if (isDiscovering) {
    return <DiscoveryLoadingScreen steps={discoverySteps} />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            {t('error')}
          </h2>
          <p className="text-text-secondary">{error}</p>
          <button onClick={() => router.push('/submit')} className="btn-observatory">
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!publishResult) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-6 animate-bounce-in">
        <div className="w-24 h-24 mx-auto rounded-full bg-success-soft/10 border-2 border-success-soft flex items-center justify-center">
          <CheckCircle className="w-14 h-14 text-success-soft" />
        </div>
        <h1 className="text-4xl font-bold text-text-primary">
          {t('title')}
        </h1>
        <p className="text-xl text-text-secondary">
          {t('subtitle')}
        </p>
      </div>

      {/* Rewards Section */}
      <RewardsSection result={publishResult} />

      {/* Action Buttons */}
      <div className="glass-card p-8">
        <div className="grid grid-cols-3 gap-4">
          <Link
            href={`/experiences/${publishResult.experienceId}`}
            className="glass-card-accent p-6 hover:bg-space-deep/40 transition-all group text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <ArrowRight className="w-8 h-8 text-observatory-gold group-hover:translate-x-1 transition-transform" />
              <span className="text-sm font-medium text-text-primary">
                {t('view')}
              </span>
            </div>
          </Link>

          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/experiences/${publishResult.experienceId}`;
              navigator.clipboard.writeText(shareUrl);
            }}
            className="glass-card-accent p-6 hover:bg-space-deep/40 transition-all group text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <Share2 className="w-8 h-8 text-observatory-gold group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-text-primary">
                {t('share')}
              </span>
            </div>
          </button>

          <button
            onClick={handleSubmitAnother}
            className="glass-card-accent p-6 hover:bg-space-deep/40 transition-all group text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <Plus className="w-8 h-8 text-observatory-gold group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-medium text-text-primary">
                {t('submitAnother')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Pattern Insights */}
      {patternInsights.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-observatory-gold" />
            <h2 className="text-2xl font-bold text-text-primary">
              {t('insights.title')}
            </h2>
          </div>

          <div className="grid gap-4">
            {patternInsights.map((insight, index) => {
              if (insight.type === 'wave') {
                return (
                  <WaveAlertCard
                    key={`wave-${index}`}
                    count={insight.data.count}
                    location={insight.data.location}
                    timeframe={insight.data.timeframe}
                    trend={insight.data.trend}
                    onExplore={() => router.push(`/patterns/waves`)}
                    delay={index * 0.2}
                  />
                );
              }

              if (insight.type === 'solar') {
                return (
                  <CorrelationCard
                    key={`solar-${index}`}
                    type="solar"
                    title={t('insights.solar.title')}
                    description={t('insights.solar.description')}
                    metric={{
                      value: insight.data.kpIndex,
                      label: 'KP-Index',
                    }}
                    percentage={insight.data.percentage}
                    onExplore={() => router.push(`/patterns/correlations`)}
                    delay={index * 0.2}
                  />
                );
              }

              if (insight.type === 'lunar') {
                return (
                  <CorrelationCard
                    key={`lunar-${index}`}
                    type="lunar"
                    title={t('insights.lunar.title')}
                    description={t('insights.lunar.description')}
                    metric={{
                      value: `${Math.round(insight.data.illumination * 100)}%`,
                      label: 'Illumination',
                    }}
                    percentage={insight.data.percentage}
                    onExplore={() => router.push(`/patterns/correlations`)}
                    delay={index * 0.2}
                  />
                );
              }

              if (insight.type === 'seismic') {
                return (
                  <CorrelationCard
                    key={`seismic-${index}`}
                    type="seismic"
                    title={t('insights.seismic.title')}
                    description={t('insights.seismic.description')}
                    metric={{
                      value: insight.data.magnitude,
                      label: 'Magnitude',
                    }}
                    onExplore={() => router.push(`/patterns/correlations`)}
                    delay={index * 0.2}
                  />
                );
              }

              if (insight.type === 'temporal') {
                return (
                  <TemporalPatternCard
                    key={`temporal-${index}`}
                    period={insight.data.period}
                    count={insight.data.count}
                    trend={insight.data.trend}
                    comparison={insight.data.comparison}
                    onExplore={() => router.push(`/patterns/timeline`)}
                    delay={index * 0.2}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* Similar Experiences */}
      <SimilarExperiencesSection experienceId={publishResult.experienceId} />
    </div>
  );
}
