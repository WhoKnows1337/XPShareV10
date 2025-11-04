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
  const [externalLinks, setExternalLinks] = useState<LinkMetadata[]>([]);

  const handleReset = async () => {
    if (showResetConfirm) {
      // Get uploaded media URLs for cleanup
      const uploadedUrls = screen4.uploadedMedia?.map(m => m.url) || [];

      // Call cleanup API if there are uploads
      if (uploadedUrls.length > 0) {
        try {
          const response = await fetch('/api/media/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: uploadedUrls }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[Reset] Cleaned up', result.deleted, 'files from R2');
          } else {
            console.warn('[Reset] Cleanup API returned error:', response.status);
          }
        } catch (err) {
          console.warn('[Reset] Cleanup request failed:', err);
          // Continue with reset even if cleanup fails
        }
      }

      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  // Handle Uppy upload completion - SYNC TO STORE
  const handleUploadComplete = (files: Array<{
    url: string;
    type: string;
    fileName: string;
    size: number;
    mimeType?: string;
    duration?: number;
    width?: number;
    height?: number;
  }>) => {
    console.log('[FilesWitnessesScreen] handleUploadComplete called with', files.length, 'files');

    // ✅ FIX: Sync to store instead of local state
    // Transform to store format with required fields
    const mediaItems = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: file.url,
      type: normalizeMediaType(file.type),
      fileName: file.fileName, // ✅ Use extracted filename from server response
      mimeType: file.mimeType, // ✅ Include original MIME type
      size: file.size, // ✅ Use extracted file size from server response
      duration: file.duration,
      width: file.width,
      height: file.height,
    }));

    console.log('[FilesWitnessesScreen] Syncing to store:', mediaItems);

    // Update store with all uploaded media
    useSubmitFlowStore.setState((state) => ({
      screen4: {
        ...state.screen4,
        uploadedMedia: mediaItems,
      },
    }));
  };

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

  const handlePublishClick = async (visibility: 'public' | 'anonymous' | 'private') => {
    try {
      setPublishing(true);
      useSubmitFlowStore.setState((state) => ({
        screen4: { ...state.screen4, visibility },
      }));
      toast.loading(t('toast.publishing'), { id: 'publish' });

      const uploadedFiles = screen4.uploadedMedia || [];
      console.log('[Publish] Using uploaded media from store:', uploadedFiles);

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

      const durationMap: Record<string, string> = {
        'less_than_1min': 'seconds',
        '1_to_5min': 'minutes',
        'more_than_5min': 'minutes',
      };

      const dateOccurredISO = screen2.date
        ? (screen2.date.includes('T') ? screen2.date : `${screen2.date}T12:00:00.000Z`)
        : null;

      const experienceData = {
        text: screen1.text,
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
        questionAnswers: Object.entries(screen2.extraQuestions || {}).map(([id, answer]) => ({
          id,
          question: id,
          answer,
          type: typeof answer === 'boolean' ? 'boolean' :
                typeof answer === 'number' ? 'number' : 'text'
        })),
        summary: screen3.summary || '',
        enhancedText: screen3.enhancementEnabled ? screen3.enhancedText : screen1.text,
        enhancementEnabled: screen3.enhancementEnabled,
        aiEnhancementUsed: screen3.enhancementEnabled,
        userEditedAi: false,
        visibility: visibility,
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
        externalLinks: externalLinks,
        language: 'de',
      };

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
      toast.success(t('toast.publishSuccess'), { id: 'publish' });
      reset();
      router.replace(`/experiences/${result.experienceId}`);

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

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="files" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Files & Media</span>
            <span className="sm:hidden">Files</span>
            {screen4.uploadedMedia?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {screen4.uploadedMedia.length}
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
            {screen4.witnesses?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {screen4.witnesses?.length || 0}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4 data-[state=inactive]:hidden" forceMount>
          <FileUploadSection
            ref={uppyRef}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>

        <TabsContent value="links" className="space-y-4 data-[state=inactive]:hidden" forceMount>
          <LinkSection onLinksChange={setExternalLinks} />
        </TabsContent>

        <TabsContent value="witnesses" className="space-y-4 data-[state=inactive]:hidden" forceMount>
          <WitnessesSection />
        </TabsContent>
      </Tabs>

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
