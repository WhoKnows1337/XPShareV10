'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Pencil, Info } from 'lucide-react';
import { useState, forwardRef } from 'react';
import { toast } from 'sonner';
import { SketchModal } from './SketchModal';
import { UppyFileUpload, type UppyFileUploadRef } from './UppyFileUpload';

interface FileUploadSectionProps {
  onUploadComplete?: (uploadedFiles: Array<{
    url: string;
    type: string;
    fileName: string;      // ✅ Original filename
    size: number;          // ✅ File size in bytes
    mimeType?: string;     // ✅ Original MIME type
    duration?: number;
    width?: number;
    height?: number;
  }>) => void;
}

export const FileUploadSection = forwardRef<UppyFileUploadRef, FileUploadSectionProps>(
  ({ onUploadComplete }, ref) => {
  const t = useTranslations('submit.screen4.files');
  const [showSketchModal, setShowSketchModal] = useState(false);

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

        {/* Upload Limits Info */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-observatory-gold/5 border border-observatory-gold/20">
          <Info className="w-4 h-4 text-observatory-gold/80 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-text-secondary space-y-0.5">
            <p className="font-medium text-observatory-gold/90">Max. Dateigrößen:</p>
            <p>Bilder: 20 MB • Videos: 1 GB • Audio: 200 MB • Dokumente: 200 MB</p>
          </div>
        </div>
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
