'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { useState, forwardRef } from 'react';
import { toast } from 'sonner';
import { SketchModal } from './SketchModal';
import { UppyFileUpload, type UppyFileUploadRef } from './UppyFileUpload';

interface FileUploadSectionProps {
  onUploadComplete?: (uploadedFiles: Array<{
    url: string;
    duration?: number;
    width?: number;
    height?: number;
  }>) => void;
}

export const FileUploadSection = forwardRef<UppyFileUploadRef, FileUploadSectionProps>(
  ({ onUploadComplete }, ref) => {
  const t = useTranslations('submit.screen4.files');
  const { updateScreen4 } = useSubmitFlowStore();
  const [showSketchModal, setShowSketchModal] = useState(false);

  const handleFilesReady = (files: File[]) => {
    // Update store with files for local preview/management
    updateScreen4({ files });
  };

  const handleSketchSave = (file: File) => {
    // Add sketch to Uppy programmatically via ref
    if (ref && typeof ref !== 'function' && ref.current) {
      try {
        ref.current.addFile(file);
        toast.success('Sketch added successfully');
      } catch (err) {
        toast.error('Failed to add sketch');
      }
    }
    setShowSketchModal(false);
  };

  const handleError = (error: Error) => {
    toast.error('Upload error', {
      description: error.message,
    });
  };

  return (
    <>
      <div className="card-observatory p-3 sm:p-4 space-y-3">
        {/* Uppy Component with built-in dropzone, camera, and audio */}
        <UppyFileUpload
          ref={ref}
          onFilesReady={handleFilesReady}
          onUploadComplete={onUploadComplete}
          onError={handleError}
        />

        {/* Sketch Button */}
        <button
          onClick={() => setShowSketchModal(true)}
          className="w-full p-2.5 rounded-lg border-2 border-dashed border-observatory-gold/30
            hover:border-observatory-gold/60 hover:bg-observatory-gold/5
            transition-all flex items-center justify-center gap-2"
        >
          <Pencil className="w-4 h-4 text-observatory-gold" />
          <span className="text-sm text-observatory-gold font-medium">
            {t('sketch', 'Draw a Sketch')}
          </span>
        </button>
      </div>

      {/* Sketch Modal */}
      <SketchModal
        open={showSketchModal}
        onClose={() => setShowSketchModal(false)}
        onSave={handleSketchSave}
      />
    </>
  );
});

FileUploadSection.displayName = 'FileUploadSection';
