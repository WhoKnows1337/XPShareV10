'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FileUploadSection } from './FileUploadSection';
import { WitnessesSection } from './WitnessesSection';
import { SplitPublishButton } from './SplitPublishButton';
import { NavigationButtons } from '../shared/NavigationButtons';

export function FilesWitnessesScreen() {
  const t = useTranslations('submit.screen4');
  const router = useRouter();
  const { screen1, screen2, screen3, screen4, goBack, reset, setPublishing } = useSubmitFlowStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const handlePublish = async (visibility: 'public' | 'anonymous' | 'private') => {
    try {
      setPublishing(true);

      // Update visibility in store
      useSubmitFlowStore.setState((state) => ({
        screen4: { ...state.screen4, visibility },
      }));

      toast.loading('Publishing your experience...', { id: 'publish' });

      // Step 1: Upload files if any
      const uploadedFileUrls: string[] = [];
      if (screen4.files.length > 0) {
        toast.loading(`Uploading ${screen4.files.length} file(s)...`, { id: 'publish' });

        for (let i = 0; i < screen4.files.length; i++) {
          const file = screen4.files[i];
          const formData = new FormData();
          formData.append('file', file);

          // Determine file type (with fallback for deserialized files)
          const fileType = file.type || '';
          const fileName = file.name || '';

          let type = 'photo';
          if (fileType.startsWith('video/') || /\.(mp4|mov|avi|webm)$/i.test(fileName)) {
            type = 'video';
          } else if (fileType.startsWith('audio/') || /\.(mp3|wav|m4a|ogg)$/i.test(fileName)) {
            type = 'audio';
          } else if (fileName.includes('sketch')) {
            type = 'sketch';
          }

          formData.append('type', type);

          const uploadRes = await fetch('/api/media/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const uploadData = await uploadRes.json();
          uploadedFileUrls.push(uploadData.url);
        }
      }

      // Step 2: Prepare experience data
      const experienceData = {
        // Screen 1
        text: screen1.text,
        wordCount: screen1.wordCount,

        // Screen 2
        title: screen2.title,
        category: screen2.category,
        tags: screen2.tags,
        attributes: screen2.attributes,
        date: screen2.date,
        time: screen2.time,
        location: screen2.location,
        locationLat: screen2.locationLat,
        locationLng: screen2.locationLng,
        duration: screen2.duration,
        extraQuestions: screen2.extraQuestions,

        // Screen 3
        summary: screen3.summary,
        enhancedText: screen3.enhancementEnabled ? screen3.enhancedText : screen1.text,

        // Screen 4
        visibility,
        mediaUrls: uploadedFileUrls,
        witnesses: screen4.witnesses,
      };

      // Step 3: Publish experience
      toast.loading('Creating your experience...', { id: 'publish' });

      const publishRes = await fetch('/api/submit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceData),
      });

      if (!publishRes.ok) {
        const error = await publishRes.json();
        throw new Error(error.details || error.error || 'Failed to publish');
      }

      const result = await publishRes.json();

      // Success!
      toast.success('Experience published successfully!', { id: 'publish' });

      // Clear the draft and navigate to success screen
      reset();

      // Navigate to the experience detail page
      router.push(`/experiences/${result.experienceId}`);

      // Show rewards notification
      if (result.xpEarned > 0) {
        setTimeout(() => {
          toast.success(`+${result.xpEarned} XP earned!`, {
            description: result.badgesEarned.length > 0
              ? `Badges earned: ${result.badgesEarned.join(', ')}`
              : undefined,
          });
        }, 500);
      }

      if (result.leveledUp) {
        setTimeout(() => {
          toast.success(`Level Up! You're now level ${result.newLevel}! 🎉`);
        }, 1000);
      }

    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error('Failed to publish', {
        id: 'publish',
        description: error.message || 'Please try again',
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
      className="space-y-3"
    >
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-2"
      >
        <h1 className="section-title-observatory text-base sm:text-lg">
          {t('title')}
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Side-by-Side Layout - Desktop: 50/50, Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-none lg:max-h-[600px]">
        {/* File Upload Section - Compact */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="min-h-0"
        >
          <FileUploadSection />
        </motion.div>

        {/* Witnesses Section - Compact */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="min-h-0"
        >
          <WitnessesSection />
        </motion.div>
      </div>

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

        <SplitPublishButton onPublish={handlePublish} />
      </motion.div>
    </motion.div>
  );
}
