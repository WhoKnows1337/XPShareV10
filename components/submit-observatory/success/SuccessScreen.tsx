'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { CheckCircle, ArrowRight, Share2, Plus, Sparkles, Users, TrendingUp } from 'lucide-react';
import { SimilarExperiencesSection } from './SimilarExperiencesSection';
import { RewardsSection } from './RewardsSection';
import { DiscoveryLoadingScreen } from './DiscoveryLoadingScreen';
import { WaveAlertCard } from './WaveAlertCard';
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
  type: 'wave' | 'temporal';
  data: any;
}

interface DiscoveryStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  icon: typeof Users;
  count?: number;
  insights?: number;
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
  const [similarExperiences, setSimilarExperiences] = useState<any[]>([]);

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
        setSimilarExperiences(similar); // Store for later use
        setDiscoverySteps(prev => prev.map(s =>
          s.id === 'similar'
            ? { ...s, status: 'completed', count: similar.length }
            : { ...s, status: 'active' }
        ));
      } else {
        console.warn('Failed to find similar experiences:', await similarResponse.text());
      }

      // Step 2: Pattern Analysis
      const patternsResponse = await fetch(`/api/patterns/for-experience/${experienceId}`);

      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json();

        // New simplified API returns insights directly as array
        if (patternsData.insights && patternsData.insights.length > 0) {
          patternsData.insights.forEach((insight: any) => {
            insights.push({
              type: insight.type,
              data: insight,
            });
          });
        }

        setDiscoverySteps(prev => prev.map(s =>
          s.id === 'patterns'
            ? { ...s, status: 'completed', insights: insights.length }
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
      <SimilarExperiencesSection
        experienceId={publishResult.experienceId}
        similarData={similarExperiences}
      />
    </div>
  );
}
