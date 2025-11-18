'use client';

import { useState, useRef } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FileText, Link2, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileUploadSection } from './FileUploadSection';
import { WitnessesSection } from './WitnessesSection';
import { LinkSection } from './LinkSection';
import { SplitPublishButton } from './SplitPublishButton';
import { NavigationButtons } from '../shared/NavigationButtons';
import { UppyFileUploadRef } from './UppyFileUpload';
import type { LinkMetadata } from '@/lib/types/link-preview';

export function FilesWitnessesScreen() {
  const t = useTranslations('submit.screen4');
  const locale = useLocale();
  const router = useRouter();
  const { screen1, screen2, screen3, screen4, goBack, reset, setPublishing, setCurrentStep } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const uppyRef = useRef<UppyFileUploadRef | null>(null);
  const [externalLinks, setExternalLinks] = useState<LinkMetadata[]>([]);
  const [publishError, setPublishError] = useState<{ message: string; details?: Record<string, string[]> } | null>(null);

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

    // ✅ FIX: MERGE new files with existing ones (don't overwrite!)
    useSubmitFlowStore.setState((state) => ({
      screen4: {
        ...state.screen4,
        uploadedMedia: [
          ...(state.screen4.uploadedMedia || []),  // Keep existing files
          ...mediaItems  // Add new files
        ],
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

      // ✅ FIX: Filter out attributes without values (e.g., has_witnesses, has_documentation)
      const transformedAttributes = screen2.attributes ? Object.fromEntries(
        Object.entries(screen2.attributes)
          .filter(([key, attr]) => {
            // Only include attributes that have a non-empty value
            const hasValue = attr && 'value' in attr && String(attr.value || '').trim().length > 0;
            if (!hasValue) {
              console.log(`[Publish] Skipping attribute "${key}" with empty value`);
            }
            return hasValue;
          })
          .map(([key, attr]) => {
            // Convert confidence to 0-1 range
            let confidence = attr.confidence;
            if (typeof confidence === 'number') {
              confidence = confidence > 1 ? confidence / 100 : confidence;
            } else if (typeof confidence === 'string') {
              confidence = parseFloat(confidence);
              confidence = confidence > 1 ? confidence / 100 : confidence;
            } else {
              confidence = 0.95; // Default confidence
            }
            // Ensure it's within 0-1 range
            confidence = Math.min(1, Math.max(0, confidence));

            return [
              key,
              {
                ...attr,
                confidence,
              },
            ];
          })
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
        duration: (screen2.duration && screen2.duration.trim()) ? (durationMap[screen2.duration] || screen2.duration) : null,
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

        // Set error state for UI display
        setPublishError({
          message: error.error || 'Failed to publish',
          details: error.details,
        });

        toast.error(t('toast.publishError'), { id: 'publish' });
        return; // Exit early instead of throwing
      }

      const result = await publishRes.json();
      toast.success(t('toast.publishSuccess'), { id: 'publish' });

      // Clear any previous errors
      setPublishError(null);

      // Store publish result in the store for potential future use
      useSubmitFlowStore.setState({ publishResult: result });

      // ✅ CRITICAL: Clear isDraft flag BEFORE redirect
      // This prevents the "unsaved changes" warning from blocking navigation
      useSubmitFlowStore.setState({ isDraft: false });

      // Redirect to new Discovery Reveal success page
      // Using window.location.href for hard navigation to bypass browser cache
      // ⚠️ IMPORTANT: Always include locale prefix, even for default locale
      // Client-side navigation (window.location.href) doesn't go through middleware,
      // so we need the full path to match the route pattern /[locale]/experiences/...
      const successUrl = `/${locale}/experiences/submit/success/${result.experienceId}`;
      console.log('[Publish] Redirecting to:', successUrl, 'locale:', locale);

      // ⚠️ CRITICAL: Add small delay to allow ref update in useUnsavedChangesWarning
      // Without this, window.location.href triggers beforeunload BEFORE ref is updated
      setTimeout(() => {
        window.location.href = successUrl;
      }, 10);

    } catch (error: any) {
      console.error('Publish error:', error);

      // Set error state for unexpected errors
      setPublishError({
        message: error.message || 'An unexpected error occurred',
      });

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
      {/* Publish Error Alert */}
      {publishError && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-400 font-semibold">
            Publishing Failed
          </AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p className="text-red-300">{publishError.message}</p>

            {/* Validation Errors */}
            {publishError.details && Object.keys(publishError.details).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-300">Validation Errors:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-200">
                  {Object.entries(publishError.details).map(([field, errors]) => (
                    <li key={field}>
                      <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</strong>{' '}
                      {Array.isArray(errors) ? errors.join(', ') : errors}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPublishError(null);
                  goBack();
                }}
                className="bg-slate-900/50 hover:bg-slate-800 border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back & Fix
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPublishError(null)}
                className="bg-slate-900/50 hover:bg-slate-800 border-slate-700"
              >
                Dismiss & Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
            {(screen4.uploadedMedia?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1">
                {screen4.uploadedMedia?.length ?? 0}
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
