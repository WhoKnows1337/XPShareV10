'use client';

import { FileImage, FileVideo, File as FileIcon, X } from 'lucide-react';
import { useState } from 'react';

interface FileCardProps {
  file: File;
  onRemove: () => void;
}

export function FileCard({ file, onRemove }: FileCardProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // Generate preview for images
  if (file.type.startsWith('image/') && !preview) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-observatory-gold" />;
    }
    if (file.type.startsWith('video/')) {
      return <FileVideo className="w-5 h-5 text-observatory-gold" />;
    }
    return <FileIcon className="w-5 h-5 text-observatory-gold" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-space-deep/60 border border-glass-border rounded-lg hover:border-observatory-gold/30 transition-all group">
      {/* Preview or Icon */}
      <div className="flex-shrink-0">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-12 h-12 object-cover rounded border border-glass-border"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-space-deep/80 border border-glass-border rounded">
            {getFileIcon()}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {file.name}
        </div>
        <div className="text-xs text-text-tertiary">
          {formatFileSize(file.size)}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-2 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
        aria-label="Remove file"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
