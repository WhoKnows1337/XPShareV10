'use client';

import { useEffect, useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { CheckCircle, ArrowRight, Share2, Plus, Sparkles } from 'lucide-react';
import { SimilarExperiencesSection } from './SimilarExperiencesSection';
import { RewardsSection } from './RewardsSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PublishResult {
  experienceId: string;
  xpEarned: number;
  badgesEarned: string[];
  leveledUp: boolean;
  newLevel?: number;
}

export function SuccessScreen() {
  const t = useTranslations('submit.success');
  const router = useRouter();
  const { screen1, screen2, screen3, screen4, reset } = useSubmitFlowStore();

  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handlePublish();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      // Prepare experience data
      const experienceData = {
        // Screen 1: Text
        text: screen1.text,
        wordCount: screen1.wordCount,

        // Screen 2: AI Analysis + Questions
        title: screen2.title,
        category: screen2.category,
        tags: screen2.tags,
        date: screen2.date,
        time: screen2.time,
        location: screen2.location,
        locationLat: screen2.locationLat,
        locationLng: screen2.locationLng,
        duration: screen2.duration,
        extraQuestions: screen2.extraQuestions,

        // Screen 3: Summary
        summary: screen3.summary,
        enhancedText: screen3.enhancementEnabled ? screen3.enhancedText : screen1.text,

        // Screen 4: Visibility
        visibility: screen4.visibility,

        // TODO: Handle file uploads and witnesses
        // files: screen4.files,
        // witnesses: screen4.witnesses,
      };

      // Call publish API
      const response = await fetch('/api/submit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceData),
      });

      if (!response.ok) {
        throw new Error('Publish failed');
      }

      const result = await response.json();
      setPublishResult(result);
    } catch (err: any) {
      console.error('Publish error:', err);
      setError(err.message || 'Publishing failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubmitAnother = () => {
    reset();
    router.push('/submit');
  };

  if (isPublishing) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full border-4 border-observatory-gold border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            {t('publishing', 'Veröffentliche Erfahrung...')}
          </h2>
          <p className="text-text-secondary">
            {t('publishingDesc', 'Deine Erfahrung wird gespeichert und mit ähnlichen Mustern verglichen.')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            {t('error', 'Fehler beim Veröffentlichen')}
          </h2>
          <p className="text-text-secondary">{error}</p>
          <button onClick={handlePublish} className="btn-observatory">
            {t('retry', 'Erneut versuchen')}
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
          {t('title', 'Erfahrung veröffentlicht!')}
        </h1>
        <p className="text-xl text-text-secondary">
          {t('subtitle', 'Deine Erfahrung wurde erfolgreich gespeichert und kann von anderen gesehen werden.')}
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
                {t('view', 'Erfahrung ansehen')}
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
                {t('share', 'Link teilen')}
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
                {t('submitAnother', 'Weitere eintragen')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Similar Experiences */}
      <SimilarExperiencesSection experienceId={publishResult.experienceId} />
    </div>
  );
}
