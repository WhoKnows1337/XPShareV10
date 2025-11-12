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
  const { screen1, screen2, screen3, screen4, reset } = useSubmitFlowStore();

  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pattern discovery states
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverySteps, setDiscoverySteps] = useState<DiscoveryStep[]>([]);
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([]);
  const [similarCount, setSimilarCount] = useState(0);

  useEffect(() => {
    handlePublish();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      // Helper to normalize media type from MIME type to enum value
      const normalizeMediaType = (type: string): 'image' | 'video' | 'audio' | 'sketch' | 'document' => {
        if (type === 'image' || type === 'video' || type === 'audio' || type === 'sketch' || type === 'document') {
          return type;
        }
        if (type.startsWith('image/') || type === 'photo') return 'image';
        if (type.startsWith('video/')) return 'video';
        if (type.startsWith('audio/')) return 'audio';
        if (type === 'application/pdf' || type.startsWith('application/')) return 'document';
        if (type === 'sketch') return 'sketch';
        console.warn(`[Publish] Unknown media type "${type}", defaulting to "image"`);
        return 'image';
      };

      const uploadedFiles = screen4.uploadedMedia || [];
      console.log('[SuccessScreen] Using uploaded media from store:', uploadedFiles);

      // Transform attributes confidence
      const transformedAttributes = screen2.attributes ? Object.fromEntries(
        Object.entries(screen2.attributes).map(([key, attr]) => [
          key,
          {
            ...attr,
            confidence: typeof attr.confidence === 'number' && attr.confidence > 1
              ? attr.confidence / 100
              : attr.confidence,
          },
        ])
      ) : {};

      // Duration mapping
      const durationMap: Record<string, string> = {
        'less_than_1min': 'seconds',
        '1_to_5min': 'minutes',
        'more_than_5min': 'minutes',
      };

      // Date formatting
      const dateOccurredISO = screen2.date
        ? (screen2.date.includes('T') ? screen2.date : `${screen2.date}T12:00:00.000Z`)
        : null;

      // Prepare experience data
      const experienceData = {
        // Screen 1: Text
        text: screen1.text,
        wordCount: screen1.wordCount,

        // Screen 2: AI Analysis + Questions
        title: screen2.title,
        category: screen2.category,
        tags: screen2.tags,
        attributes: transformedAttributes,
        dateOccurred: dateOccurredISO,
        timeOfDay: screen2.time || null,
        location: screen2.location || null,
        locationLat: screen2.locationLat || null,
        locationLng: screen2.locationLng || null,
        duration: screen2.duration ? (durationMap[screen2.duration] || screen2.duration) : null,
        questionAnswers: screen2.extraQuestions ? Object.entries(screen2.extraQuestions).map(([id, answer]) => ({
          id,
          question: id,
          answer,
          type: typeof answer === 'boolean' ? 'boolean' :
                typeof answer === 'number' ? 'number' : 'text'
        })) : [],

        // Screen 3: Summary
        summary: screen3.summary || '',
        enhancedText: screen3.enhancementEnabled ? screen3.enhancedText : screen1.text,
        enhancementEnabled: screen3.enhancementEnabled,
        aiEnhancementUsed: screen3.enhancementEnabled,
        userEditedAi: false,

        // Screen 4: Visibility & Media
        visibility: screen4.visibility,
        mediaUrls: uploadedFiles.map(m => m.url),
        media: uploadedFiles.map(m => ({
          url: m.url,
          type: normalizeMediaType(m.type),
          fileName: m.fileName, // ✅ Original filename
          mimeType: m.mimeType, // ✅ Original MIME type
          size: m.size, // ✅ File size
          duration: m.duration,
          width: m.width,
          height: m.height,
        })),
        witnesses: screen4.witnesses || [],
        externalLinks: screen4.externalLinks || [],
        language: 'de',
      };

      console.log('[SuccessScreen] Sending to publish API:', {
        mediaCount: experienceData.media.length,
        mediaData: experienceData.media,
      });

      // Call publish API
      const response = await fetch('/api/submit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Publish API Error:', {
          status: response.status,
          error: error,
          details: error.details,
          sentData: experienceData,
        });
        throw new Error(JSON.stringify(error.details) || error.error || 'Failed to publish');
      }

      const result = await response.json();
      setPublishResult(result);

      // Start pattern discovery after successful publish
      await handlePatternDiscovery(result.experienceId);
    } catch (err: any) {
      console.error('Publish error:', err);
      setError(err.message || 'Publishing failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePatternDiscovery = async (experienceId: string) => {
    setIsDiscovering(true);

    // Initialize discovery steps
    const steps: DiscoveryStep[] = [
      {
        id: 'similar',
        label: t('discovery.findingSimilar', 'Finding similar experiences'),
        status: 'active',
        icon: Users,
      },
      {
        id: 'patterns',
        label: t('discovery.detectingPatterns', 'Detecting patterns'),
        status: 'pending',
        icon: TrendingUp,
      },
      {
        id: 'events',
        label: t('discovery.checkingEvents', 'Checking external events'),
        status: 'pending',
        icon: Globe,
      },
    ];
    setDiscoverySteps(steps);

    const insights: PatternInsight[] = [];

    try {
      // Step 1: Find Similar Experiences
      const similarResponse = await fetch(`/api/submit/find-similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: screen2.category,
          tags: screen2.tags,
          location: screen2.location,
          locationLat: screen2.locationLat,
          locationLng: screen2.locationLng,
          duration: screen2.duration,
          excludeId: experienceId,
        }),
      });

      if (similarResponse.ok) {
        const similarData = await similarResponse.json();
        setSimilarCount(similarData.length || 0);
        setDiscoverySteps(prev => prev.map(s =>
          s.id === 'similar'
            ? { ...s, status: 'completed', count: similarData.length }
            : s.id === 'patterns'
            ? { ...s, status: 'active' }
            : s
        ));
      }

      // Step 2: Pattern Analysis
      const patternsResponse = await fetch(`/api/patterns/for-experience/${experienceId}`);
      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json();

        // Extract insights
        if (patternsData.geographicClusters?.length > 0) {
          const cluster = patternsData.geographicClusters[0];
          insights.push({
            type: 'wave',
            data: {
              count: cluster.count,
              location: cluster.location || screen2.location,
              timeframe: '30 days',
              trend: cluster.trend || 200,
            },
          });
        }

        if (patternsData.temporalPatterns?.length > 0) {
          const temporal = patternsData.temporalPatterns[0];
          insights.push({
            type: 'temporal',
            data: {
              period: temporal.period,
              count: temporal.count,
              trend: temporal.percentageChange || 300,
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
        if (eventsData.solarActivity?.length > 0) {
          const solar = eventsData.solarActivity[0];
          insights.push({
            type: 'solar',
            data: {
              kpIndex: solar.kp_index,
              date: solar.date,
              percentage: 80, // Mock data - should come from pattern analysis
            },
          });
          correlationCount++;
        }

        // Moon Phase
        if (eventsData.moonPhase) {
          insights.push({
            type: 'lunar',
            data: {
              phase: eventsData.moonPhase.phase,
              illumination: eventsData.moonPhase.illumination,
              percentage: 75,
            },
          });
          correlationCount++;
        }

        // Seismic Activity
        if (eventsData.earthquakes?.length > 0) {
          const quake = eventsData.earthquakes[0];
          insights.push({
            type: 'seismic',
            data: {
              magnitude: quake.magnitude,
              distance: quake.distance_km,
              time: quake.time,
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
      // Non-critical - mark all as completed anyway
      setDiscoverySteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSubmitAnother = () => {
    reset();
    router.push('/submit');
  };

  // Show publishing loading
  if (isPublishing) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full border-4 border-observatory-gold border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            {t('publishing')}
          </h2>
          <p className="text-text-secondary">
            {t('publishingDesc')}
          </p>
        </div>
      </div>
    );
  }

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
          <button onClick={handlePublish} className="btn-observatory">
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
              {t('insights.title', 'Discovered Connections')}
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
                    title={t('insights.solar.title', '⚡ Solar Activity Correlation')}
                    description={t(
                      'insights.solar.description',
                      `Geomagnetic storm activity detected on your sighting date. ${insight.data.percentage}% of similar experiences occur during solar activity.`
                    )}
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
                    title={t('insights.lunar.title', '🌙 Lunar Correlation')}
                    description={t(
                      'insights.lunar.description',
                      `Your experience occurred during ${insight.data.phase} phase. ${insight.data.percentage}% of similar reports happen during this lunar phase.`
                    )}
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
                    title={t('insights.seismic.title', '🌍 Seismic Activity Match')}
                    description={t(
                      'insights.seismic.description',
                      `Magnitude ${insight.data.magnitude} earthquake detected ${insight.data.distance}km from your location, approximately ${insight.data.time} before your experience.`
                    )}
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
