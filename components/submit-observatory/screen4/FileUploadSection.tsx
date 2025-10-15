'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Camera, Video, Pencil, Upload } from 'lucide-react';
import { FileCard } from './FileCard';
import { useRef } from 'react';

export function FileUploadSection() {
  const t = useTranslations('submit.screen4.files');
  const { screen4, updateScreen4 } = useSubmitFlowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      updateScreen4({
        files: [...screen4.files, ...files],
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    updateScreen4({
      files: screen4.files.filter((_, i) => i !== index),
    });
  };

  const triggerFileUpload = (accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*/*';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title-observatory">
            {t('title')}
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="text-xs text-text-tertiary">
          {t('optional')}
        </div>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => triggerFileUpload('image/*')}
          className="glass-card-accent p-6 hover:bg-space-deep/40 transition-all group"
        >
          <Camera className="w-8 h-8 text-observatory-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium text-text-primary">
            {t('photo')}
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            {t('photoDesc')}
          </div>
        </button>

        <button
          onClick={() => triggerFileUpload('video/*')}
          className="glass-card-accent p-6 hover:bg-space-deep/40 transition-all group"
        >
          <Video className="w-8 h-8 text-observatory-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium text-text-primary">
            {t('video')}
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            {t('videoDesc')}
          </div>
        </button>

        <button
          onClick={() => triggerFileUpload('image/*')}
          className="glass-card-accent p-6 hover:bg-space-deep/40 transition-all group"
        >
          <Pencil className="w-8 h-8 text-observatory-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium text-text-primary">
            {t('sketch')}
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            {t('sketchDesc')}
          </div>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Uploaded Files */}
      {screen4.files.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-glass-border">
          <div className="text-sm font-medium text-text-secondary">
            {t('uploaded')} ({screen4.files.length})
          </div>
          <div className="space-y-2">
            {screen4.files.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => handleRemoveFile(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-observatory-gold/5 border border-observatory-gold/20 rounded-lg">
        <Upload className="w-5 h-5 text-observatory-gold flex-shrink-0 mt-0.5" />
        <div className="text-sm text-text-secondary">
          {t('info')}
        </div>
      </div>
    </div>
  );
}
