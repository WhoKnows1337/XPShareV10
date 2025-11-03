'use client';

import { useState, useRef } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FileText, Link2, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileUploadSection } from './FileUploadSection';
import { WitnessesSection } from './WitnessesSection';
import { LinkSection } from './LinkSection';
import { SplitPublishButton } from './SplitPublishButton';
import { NavigationButtons } from '../shared/NavigationButtons';
import { UppyFileUploadRef } from './UppyFileUpload';
import type { LinkMetadata } from '@/lib/types/link-preview';

export function FilesWitnessesScreen() {
  const t = useTranslations('submit.screen4');
  const router = useRouter();
  const { screen1, screen2, screen3, screen4, goBack, reset, setPublishing } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const uppyRef = useRef<UppyFileUploadRef | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{
    url: string;
    duration?: number;
    width?: number;
    height?: number;
  }>>([]);
  const [externalLinks, setExternalLinks] = useState<LinkMetadata[]>([]);

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  // Handle Uppy upload completion
  const handleUploadComplete = (files: Array<{
    url: string;
    duration?: number;
    width?: number;
    height?: number;
  }>) => {
    setUploadedMedia(files);
  };

  const handlePublishClick = async (visibility: 'public' | 'anonymous' | 'private') => {
    try {
      setPublishing(true);

      // Update visibility in store
      useSubmitFlowStore.setState((state) => ({
        screen4: { ...state.screen4, visibility },
      }));

      toast.loading(t('toast.publishing'), { id: 'publish' });

      // Step 1: Trigger Uppy upload if files exist
      if (screen4.files.length > 0 && uppyRef.current) {
        toast.loading(t('toast.uploadingFiles', { count: screen4.files.length }), { id: 'publish' });

        try {
          // Trigger Uppy upload - results will be captured in handleUploadComplete
          await uppyRef.current.upload();
          // Wait a bit for the complete callback
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (uploadErr) {
          throw new Error('File upload failed');
        }
      }

      // Step 2: Prepare experience data matching the publishSchema
      // Transform attributes: Convert confidence from 0-100 to 0-1
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

      // Transform duration values to match schema
      const durationMap: Record<string, string> = {
        'less_than_1min': 'seconds',
        '1_to_5min': 'minutes',
        'more_than_5min': 'minutes',
      };

      // Convert date string to ISO datetime if it exists
      const dateOccurredISO = screen2.date
        ? (screen2.date.includes('T') ? screen2.date : `${screen2.date}T12:00:00.000Z`)
        : null;

      const experienceData = {
        // Screen 1
        text: screen1.text,
        // wordCount is not needed by backend

        // Screen 2
        title: screen2.title,
        category: screen2.category,
        tags: screen2.tags,
        attributes: transformedAttributes,

        // Map date and time to expected field names
        dateOccurred: dateOccurredISO,
        timeOfDay: screen2.time || null,

        location: screen2.location || null,
        locationLat: screen2.locationLat || null,
        locationLng: screen2.locationLng || null,
        duration: screen2.duration ? (durationMap[screen2.duration] || screen2.duration) : null,

        // Convert extraQuestions object to questionAnswers array format
        questionAnswers: Object.entries(screen2.extraQuestions || {}).map(([id, answer]) => ({
          id,
          question: id, // Using id as question for now
          answer,
          type: typeof answer === 'boolean' ? 'boolean' :
                typeof answer === 'number' ? 'number' : 'text'
        })),

        // Screen 3
        summary: screen3.summary || '',
        enhancedText: screen3.enhancementEnabled ? screen3.enhancedText : screen1.text,
        enhancementEnabled: screen3.enhancementEnabled,
        aiEnhancementUsed: screen3.enhancementEnabled,
        userEditedAi: false, // TODO: Track if user edited AI enhancements

        // Screen 4
        visibility: visibility, // Keep as-is, backend validates enum values
        mediaUrls: uploadedMedia.map(m => m.url), // URLs for backwards compatibility
        media: uploadedMedia, // Extended media with metadata
        witnesses: screen4.witnesses,
        externalLinks: externalLinks, // Link preview metadata

        // Metadata - Add missing language field
        language: 'de', // TODO: Get from i18n context
      };

      // Step 3: Publish experience
      toast.loading(t('toast.creating'), { id: 'publish' });

      const publishRes = await fetch('/api/submit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceData),
      });

      if (!publishRes.ok) {
        const error = await publishRes.json();
        console.error('Publish API Error:', {
          status: publishRes.status,
          error: error,
          details: error.details,
          sentData: experienceData,
        });
        throw new Error(JSON.stringify(error.details) || error.error || 'Failed to publish');
      }

      const result = await publishRes.json();

      // Success!
      toast.success(t('toast.publishSuccess'), { id: 'publish' });

      // Navigate to the experience detail page immediately
      router.push(`/experiences/${result.experienceId}`);

      // Clear the draft after navigation
      reset();

      // Show rewards notification
      if (result.xpEarned > 0) {
        setTimeout(() => {
          toast.success(t('toast.xpEarned', { xp: result.xpEarned }), {
            description: result.badgesEarned.length > 0
              ? t('toast.badgesEarned', { badges: result.badgesEarned.join(', ') })
              : undefined,
          });
        }, 500);
      }

      if (result.leveledUp) {
        setTimeout(() => {
          toast.success(t('toast.levelUp', { level: result.newLevel }));
        }, 1000);
      }

    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error(t('toast.publishError'), {
        id: 'publish',
        description: error.message || t('toast.tryAgain'),
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <h1 className="section-title-observatory text-base sm:text-lg">
          {t('title')}
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Tab Layout */}
      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="files" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Files & Media</span>
            <span className="sm:hidden">Files</span>
            {screen4.files.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {screen4.files.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">External Links</span>
            <span className="sm:hidden">Links</span>
            {externalLinks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {externalLinks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="witnesses" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Witnesses</span>
            <span className="sm:hidden">People</span>
            {screen4.witnesses.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {screen4.witnesses.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Files Tab - forceMount to keep Uppy state */}
        <TabsContent value="files" className="space-y-4 data-[state=inactive]:hidden" forceMount>
          <FileUploadSection
            ref={uppyRef}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>

        {/* Links Tab - forceMount to keep state */}
        <TabsContent value="links" className="space-y-4 data-[state=inactive]:hidden" forceMount>
          <LinkSection onLinksChange={setExternalLinks} />
        </TabsContent>

        {/* Witnesses Tab - forceMount to keep state */}
        <TabsContent value="witnesses" className="space-y-4 data-[state=inactive]:hidden" forceMount>
          <WitnessesSection />
        </TabsContent>
      </Tabs>

      {/* Navigation - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-2"
      >
        <NavigationButtons
          onBack={goBack}
          onReset={handleReset}
          showNext={false}
          showReset={true}
          resetConfirm={showResetConfirm}
        />

        <SplitPublishButton onPublish={handlePublishClick} />
      </motion.div>
    </motion.div>
  );
}
