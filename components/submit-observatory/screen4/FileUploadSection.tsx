'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Camera, Video, Music, Pencil, Upload, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchModal } from './SketchModal';

export function FileUploadSection() {
  const t = useTranslations('submit.screen4.files');
  const { screen4, updateScreen4 } = useSubmitFlowStore();
  const [showSketchModal, setShowSketchModal] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      updateScreen4({
        files: [...screen4.files, ...acceptedFiles],
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
    },
    noClick: screen4.files.length > 0, // Disable click when files present
    noKeyboard: true,
  });

  const handleRemoveFile = (index: number) => {
    updateScreen4({
      files: screen4.files.filter((_, i) => i !== index),
    });
  };

  const handleSketchSave = (file: File) => {
    updateScreen4({
      files: [...screen4.files, file],
    });
  };

  const getFileIcon = (file: File) => {
    // Guard against undefined type (happens after persist/deserialize)
    const fileType = file.type || '';
    const fileName = file.name || '';

    if (fileType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(fileName)) {
      return <Camera className="w-4 h-4" />;
    }
    if (fileType.startsWith('video/') || /\.(mp4|mov|avi|webm)$/i.test(fileName)) {
      return <Video className="w-4 h-4" />;
    }
    if (fileType.startsWith('audio/') || /\.(mp3|wav|m4a|ogg)$/i.test(fileName)) {
      return <Music className="w-4 h-4" />;
    }
    return <Upload className="w-4 h-4" />;
  };

  return (
    <>
      <div className="glass-card p-4 space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar">
        {/* Section Header - Compact */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">
            {t('title')}
          </h2>
          <div className="text-xs text-text-tertiary">
            {t('optional')}
          </div>
        </div>

        {/* Universal Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg transition-all
            ${isDragActive
              ? 'border-observatory-gold bg-observatory-gold/10 scale-[1.02]'
              : 'border-glass-border hover:border-observatory-gold/50'
            }
            ${screen4.files.length === 0 ? 'p-8' : 'p-3'}
          `}
        >
          <input {...getInputProps()} />

          {/* Empty State */}
          {screen4.files.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <Upload
                className={`w-10 h-10 mx-auto transition-all ${
                  isDragActive ? 'text-observatory-gold scale-110' : 'text-text-tertiary'
                }`}
              />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {isDragActive ? 'Drop files here' : 'Drag & Drop files here'}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Photos, Videos, Audio, or Sketches
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={open}
                  className="btn-observatory px-4 py-1.5 text-xs"
                >
                  Browse Files
                </button>
                <button
                  onClick={() => setShowSketchModal(true)}
                  className="glass-card-accent px-4 py-1.5 text-xs hover:bg-space-deep/40 transition-all flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Draw Sketch
                </button>
              </div>
            </motion.div>
          )}

          {/* Files Grid (2x2) */}
          {screen4.files.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence>
                {screen4.files.slice(0, 3).map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group glass-card-accent p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-observatory-gold">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-text-tertiary">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add More Button */}
              {screen4.files.length < 4 && (
                <button
                  onClick={open}
                  className="glass-card-accent p-2 rounded-lg hover:bg-space-deep/40 transition-all flex items-center justify-center gap-2 border-2 border-dashed border-glass-border"
                >
                  <Plus className="w-4 h-4 text-observatory-gold" />
                  <span className="text-xs font-medium text-text-secondary">Add More</span>
                </button>
              )}
            </div>
          )}

          {/* File Counter when >3 files */}
          {screen4.files.length > 3 && (
            <div className="text-center mt-2">
              <p className="text-xs text-text-tertiary">
                + {screen4.files.length - 3} more file{screen4.files.length - 3 !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Quick Sketch Button (when files present) */}
        {screen4.files.length > 0 && (
          <button
            onClick={() => setShowSketchModal(true)}
            className="w-full glass-card-accent p-2 rounded-lg hover:bg-space-deep/40 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Pencil className="w-4 h-4 text-observatory-gold" />
            <span className="text-text-secondary">Draw a Sketch</span>
          </button>
        )}
      </div>

      {/* Sketch Modal */}
      <SketchModal
        open={showSketchModal}
        onClose={() => setShowSketchModal(false)}
        onSave={handleSketchSave}
      />
    </>
  );
}
