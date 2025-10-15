'use client';

import { useState, useRef } from 'react';
import { X, Camera, Upload, Loader2, Edit2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
}

type OCRStatus = 'idle' | 'processing' | 'complete' | 'error';

export function OCRModal({ isOpen, onClose, onTextExtracted }: OCRModalProps) {
  const t = useTranslations('submit.screen1.ocr.modal');
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process image with OCR
  const processImage = async (file: File) => {
    setStatus('processing');

    try {
      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);

      // Send to API for OCR processing
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const data = await response.json();
      setExtractedText(data.text);
      setStatus('complete');
      toast.success(t('success'));
    } catch (error) {
      console.error('OCR error:', error);
      setStatus('error');
      toast.error(t('error'));
    }
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  // Handle camera capture (mobile)
  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload button
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle insert text
  const handleInsert = () => {
    onTextExtracted(extractedText);
  };

  // Handle retry
  const handleRetry = () => {
    setStatus('idle');
    setExtractedText('');
    setSelectedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-space-deep/95 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-space-mid/95 backdrop-blur-obs border border-glass-border rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-text-primary/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Idle State - Upload Options */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleCameraCapture}
                  className="flex flex-col items-center gap-3 p-6 bg-text-primary/5 border border-text-primary/20 rounded-lg
                             hover:bg-text-primary/10 hover:border-text-primary/30 transition-all"
                >
                  <Camera className="w-8 h-8 text-observatory-gold" />
                  <span className="font-medium text-text-primary">
                    {t('camera')}
                  </span>
                </button>

                <button
                  onClick={handleFileUpload}
                  className="flex flex-col items-center gap-3 p-6 bg-text-primary/5 border border-text-primary/20 rounded-lg
                             hover:bg-text-primary/10 hover:border-text-primary/30 transition-all"
                >
                  <Upload className="w-8 h-8 text-observatory-gold" />
                  <span className="font-medium text-text-primary">
                    {t('upload')}
                  </span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-12">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-xs rounded-lg border border-glass-border"
                />
              )}
              <Loader2 className="w-12 h-12 text-observatory-gold animate-spin" />
              <p className="text-text-secondary font-medium">
                {t('analyzing')}
              </p>
            </div>
          )}

          {/* Complete State */}
          {status === 'complete' && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success-soft/15 border border-success-soft/30 rounded-md">
                <Check className="w-4 h-4 text-success-soft" />
                <span className="text-sm font-semibold text-success-soft">
                  {t('recognized')}
                </span>
              </div>

              {/* Preview Image */}
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Scanned"
                  className="max-w-xs rounded-lg border border-glass-border"
                />
              )}

              {/* Extracted Text */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('extracted')}
                </label>
                {isEditing ? (
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full min-h-[120px] input-observatory"
                  />
                ) : (
                  <pre className="p-4 bg-space-deep/60 border border-glass-border rounded-lg text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                    {extractedText}
                  </pre>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-text-primary/5 border border-text-primary/20 rounded-lg
                             text-text-secondary hover:bg-text-primary/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditing ? t('doneEditing') : t('edit')}
                </button>
                <button
                  onClick={handleInsert}
                  className="flex-1 btn-observatory"
                >
                  {t('insert')}
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-8 space-y-4">
              <p className="text-error-soft font-medium">
                {t('errorMessage')}
              </p>
              <button
                onClick={handleRetry}
                className="btn-observatory"
              >
                {t('retry')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
