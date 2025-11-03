'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import type Uppy from '@uppy/core';
import { createUppyInstance } from '@/lib/utils/uppy-config';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, Music, Video, Image as ImageIcon, Play, Pause, CheckCircle, AlertCircle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CameraCapture } from './media/CameraCapture';
import { AudioRecorder } from './media/AudioRecorder';
import { MediaPreviewModal } from './media/MediaPreviewModal';
import { UPLOAD_LIMITS } from '@/lib/constants/upload-limits';
import { extractVideoThumbnail } from '@/lib/utils/video-thumbnail';

// Import Uppy CSS
import '@uppy/core/css/style.css';

export interface UppyFileUploadProps {
  onFilesReady?: (files: File[]) => void;
  onUploadComplete?: (uploadedFiles: Array<{
    url: string;
    duration?: number;
    width?: number;
    height?: number;
  }>) => void;
  onError?: (error: Error) => void;
}

export interface UppyFileUploadRef {
  getUppy: () => Uppy | null;
  upload: () => Promise<void>;
  addFile: (file: File) => void;
}

interface UppyFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: File;
  preview?: string;
  error?: string; // Upload error message
  progress?: {
    uploadComplete: boolean;
    uploadStarted: boolean;
    percentage: number;
    bytesUploaded?: number;
    bytesTotal?: number;
  };
}

/**
 * Headless Uppy wrapper with full-featured custom XPShare UI
 * - Image Thumbnails/Previews & Lightbox
 * - Video Thumbnails
 * - Individual File Progress with ETA
 * - Camera/Audio Recording
 * - Accessibility (ARIA, Keyboard Navigation)
 * - Mobile Optimized (44px Touch Targets)
 */
export const UppyFileUpload = forwardRef<UppyFileUploadRef, UppyFileUploadProps>(
  ({ onFilesReady, onUploadComplete, onError }, ref) => {
    const uppyRef = useRef<Uppy | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCounterRef = useRef(0);
    const [files, setFiles] = useState<UppyFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadETA, setUploadETA] = useState<string | null>(null);
    const uploadStartTimeRef = useRef<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const [previewModalIndex, setPreviewModalIndex] = useState<number | null>(null);

    // Store callbacks in refs
    const onFilesReadyRef = useRef(onFilesReady);
    const onUploadCompleteRef = useRef(onUploadComplete);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onFilesReadyRef.current = onFilesReady;
      onUploadCompleteRef.current = onUploadComplete;
      onErrorRef.current = onError;
    }, [onFilesReady, onUploadComplete, onError]);

    // Initialize Uppy instance
    useEffect(() => {
      if (uppyRef.current) return;

      const uppy = createUppyInstance({
        maxFileSize: UPLOAD_LIMITS.MAX_FILE_SIZE.DEFAULT,
        maxNumberOfFiles: UPLOAD_LIMITS.MAX_FILES,
        onComplete: (uploadedFiles) => {
          console.log('[onComplete] All uploads finished');
          setIsUploading(false);
          // Force update file list to ensure uploadComplete flags are set
          updateFileList(uppy);
          if (onUploadCompleteRef.current) {
            onUploadCompleteRef.current(uploadedFiles);
          }
        },
        onError: (error) => {
          setIsUploading(false);
          if (onErrorRef.current) {
            onErrorRef.current(error);
          }
        },
      });

      // Track file changes
      uppy.on('file-added', (file) => {
        console.log('[file-added]', file.name);
        setIsProcessing(false); // Stop processing when file is added
        updateFileList(uppy);
        if (onFilesReadyRef.current) {
          const fileObjects = uppy.getFiles().map(f => f.data as File);
          onFilesReadyRef.current(fileObjects);
        }
      });

      uppy.on('file-removed', () => {
        console.log('[file-removed]');
        updateFileList(uppy);
      });

      // Update UI when thumbnails are generated
      uppy.on('thumbnail:generated', (file, preview) => {
        console.log('[thumbnail:generated]', file.name);
        updateFileList(uppy);
      });

      // Extract video thumbnails for preview
      uppy.on('file-added', async (file) => {
        if (file.type.startsWith('video/')) {
          console.log('[file-added] Extracting video thumbnail for', file.name);
          try {
            const thumbnail = await extractVideoThumbnail(file.data as File, 1);
            uppy.setFileState(file.id, { preview: thumbnail });
            updateFileList(uppy);
          } catch (err) {
            console.warn('[file-added] Failed to extract video thumbnail:', err);
            // Continue without thumbnail - non-critical
          }
        }
      });

      // CRITICAL: Track upload progress
      uppy.on('upload-progress', (file, progress) => {
        console.log('[upload-progress]', file?.name, `${progress.bytesUploaded}/${progress.bytesTotal}`);
        updateFileList(uppy);

        // Ensure isUploading is true during upload
        setIsUploading(true);

        // Calculate overall progress based on bytes
        const allFiles = uppy.getFiles();
        let totalBytes = 0;
        let uploadedBytes = 0;

        allFiles.forEach(f => {
          if (f.progress?.bytesTotal) {
            totalBytes += f.progress.bytesTotal;
            uploadedBytes += f.progress.bytesUploaded || 0;
          }
        });

        const currentProgress = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;
        setUploadProgress(currentProgress);

        // Calculate ETA
        if (uploadStartTimeRef.current && uploadedBytes > 0 && currentProgress < 100) {
          const elapsed = Date.now() - uploadStartTimeRef.current;
          const speed = uploadedBytes / elapsed; // bytes per ms
          const remaining = totalBytes - uploadedBytes;
          const etaMs = remaining / speed;

          // Format ETA
          if (etaMs < 60000) {
            setUploadETA(`${Math.ceil(etaMs / 1000)}s remaining`);
          } else {
            const minutes = Math.ceil(etaMs / 60000);
            setUploadETA(`${minutes} min remaining`);
          }
        }

        console.log('[upload-progress] Overall:', currentProgress, '%');
      });

      uppy.on('upload', (data) => {
        console.log('[upload] Started with', data?.fileIDs?.length || 0, 'files');
        setIsUploading(true);
        setUploadProgress(0); // Reset to 0 at start
        setUploadETA(null); // Reset ETA
        uploadStartTimeRef.current = Date.now(); // Track start time
      });

      uppy.on('upload-success', (file, response) => {
        console.log('[upload-success]', file?.name);
        updateFileList(uppy);
      });

      uppy.on('upload-error', (file, error) => {
        console.error('[upload-error]', file?.name, error);
        setUploadETA(null); // Reset ETA on error
        updateFileList(uppy);
      });

      uppy.on('complete', (result) => {
        console.log('[complete]', result.successful.length, 'successful,', result.failed.length, 'failed');
        setUploadProgress(100); // Show 100% briefly
        setUploadETA(null); // Reset ETA to prevent stuck "1s remaining"

        setTimeout(() => {
          setIsUploading(false); // Hide progress bar after delay
          setUploadProgress(0); // Reset progress
          // Force file list update to show final state
          updateFileList(uppy);
        }, 500);
      });

      uppyRef.current = uppy;

      return () => {
        if (uppyRef.current) {
          uppyRef.current.destroy();
          uppyRef.current = null;
        }
      };
    }, []);

    // Cleanup audio object URLs on unmount
    useEffect(() => {
      return () => {
        // Revoke audio URL if playing
        if (audioRef.current?.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      };
    }, []);

    const updateFileList = (uppy: Uppy) => {
      const uppyFiles = uppy.getFiles().map(f => {
        const isCompleted = f.progress?.uploadComplete === true;
        console.log(`[updateFileList] ${f.name}: uploadStarted=${f.progress?.uploadStarted}, uploadComplete=${isCompleted}, progress=${f.progress?.percentage}%`);

        return {
          id: f.id,
          name: f.name,
          type: f.type || '',
          size: f.size,
          data: f.data as File,
          preview: f.preview,
          error: f.error,
          progress: f.progress,
        };
      });
      setFiles(uppyFiles);
    };

    // Dropzone for drag & drop
    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
      console.log('[onDrop] acceptedFiles:', acceptedFiles);
      console.log('[onDrop] fileRejections:', fileRejections);

      if (!uppyRef.current) return;

      // Check if files were rejected
      if (fileRejections.length > 0) {
        console.error('[onDrop] Files rejected:', fileRejections);
        fileRejections.forEach(rejection => {
          console.error(`  - ${rejection.file.name} (${(rejection.file.size / 1024 / 1024).toFixed(2)} MB):`, rejection.errors);
          rejection.errors.forEach((error: any) => {
            console.error(`    ERROR: ${error.code} - ${error.message}`);
          });
        });

        // Show user-friendly error message
        const errorMessages = fileRejections.map(r =>
          `${r.file.name}: ${r.errors.map((e: any) => e.message).join(', ')}`
        ).join('\n');
        alert(`Upload failed:\n\n${errorMessages}`);
        setIsProcessing(false);
        return; // Stop here if files rejected
      }

      setIsProcessing(true);
      console.log('[onDrop] Processing', acceptedFiles.length, 'accepted files...');

      acceptedFiles.forEach(file => {
        try {
          uppyRef.current!.addFile({
            name: file.name,
            type: file.type,
            data: file,
          });
        } catch (err: any) {
          // Check if it's a duplicate file error
          if (err?.message?.includes('duplicate')) {
            const shouldAdd = window.confirm(
              `Die Datei "${file.name}" existiert bereits in der Liste.\n\nMöchtest du sie trotzdem hinzufügen?`
            );

            if (shouldAdd && uppyRef.current) {
              // Add with modified name to avoid duplicate error
              const timestamp = Date.now();
              const nameParts = file.name.split('.');
              const extension = nameParts.pop();
              const baseName = nameParts.join('.');
              const newName = `${baseName} (${timestamp}).${extension}`;

              try {
                uppyRef.current.addFile({
                  name: newName,
                  type: file.type,
                  data: file,
                });
              } catch (retryErr) {
                console.error('[onDrop] Failed to add duplicate file:', retryErr);
                setIsProcessing(false);
              }
            } else {
              setIsProcessing(false);
            }
          } else {
            console.error('[onDrop] Failed to add file:', err);
            setIsProcessing(false);
          }
        }
      });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: UPLOAD_LIMITS.ALLOWED_EXTENSIONS,
      maxSize: UPLOAD_LIMITS.MAX_FILE_SIZE.DEFAULT,
      maxFiles: UPLOAD_LIMITS.MAX_FILES,
      noClick: false, // Enable click to browse
      noKeyboard: false, // Enable keyboard
    });

    // File handler for native camera/audio
    const handleMediaCapture = useCallback((file: File) => {
      if (!uppyRef.current) {
        console.error('[handleMediaCapture] Uppy instance not found!');
        return;
      }

      console.log('[handleMediaCapture] Received file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      setIsProcessing(true);

      try {
        const mediaType = file.name.includes('photo') ? 'photo' :
                          file.name.includes('video') ? 'video' :
                          file.name.includes('audio') ? 'audio' : 'photo';

        // Generate friendly name for audio recordings
        let displayName = file.name;
        if (mediaType === 'audio' && file.name.startsWith('Audio Recording')) {
          audioCounterRef.current += 1;
          displayName = `Audio Recording #${audioCounterRef.current}`;
        }

        console.log('[handleMediaCapture] Adding to Uppy with type:', mediaType, 'name:', displayName);

        uppyRef.current.addFile({
          name: displayName,
          type: file.type,
          data: file,
          meta: {
            type: mediaType,
          },
        });

        console.log('[handleMediaCapture] File added successfully');
        // isProcessing will be set to false by file-added event
      } catch (err) {
        console.error('[handleMediaCapture] Failed to add file to Uppy:', err);
        setIsProcessing(false);
      }
    }, []);

    const removeFile = (fileId: string) => {
      uppyRef.current?.removeFile(fileId);
    };

    // Audio playback handlers
    const toggleAudioPlayback = useCallback((file: UppyFile) => {
      if (!audioRef.current) return;

      if (playingAudioId === file.id) {
        // Pause currently playing audio
        audioRef.current.pause();
        setPlayingAudioId(null);
      } else {
        // Cleanup previous audio URL if exists
        const oldSrc = audioRef.current.src;
        if (oldSrc && oldSrc.startsWith('blob:')) {
          URL.revokeObjectURL(oldSrc);
        }

        // Play new audio
        const audioUrl = URL.createObjectURL(file.data);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudioId(file.id);

        // Cleanup URL when audio ends
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setPlayingAudioId(null);
        };
      }
    }, [playingAudioId]);

    const startUpload = async () => {
      if (!uppyRef.current || files.length === 0) return;
      await uppyRef.current.upload();
    };

    const cancelUpload = () => {
      if (uppyRef.current) {
        uppyRef.current.cancelAll();
        setIsUploading(false);
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getUppy: () => uppyRef.current,
      upload: startUpload,
      addFile: (file: File) => {
        if (!uppyRef.current) return;
        try {
          uppyRef.current.addFile({
            name: file.name,
            type: file.type,
            data: file,
            meta: {
              type: file.name.includes('sketch') ? 'sketch' :
                    file.type.startsWith('video/') ? 'video' :
                    file.type.startsWith('audio/') ? 'audio' : 'photo',
            },
          });
        } catch (err) {
          console.error('Failed to add file to Uppy:', err);
          if (onError) {
            onError(err as Error);
          }
        }
      },
    }));

    const getFileIcon = (type: string) => {
      if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
      if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
      if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
      return <FileIcon className="w-5 h-5" />;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
      <div className="space-y-3">
        {/* Drop Zone - Responsive padding */}
        <div
          {...getRootProps()}
          role="button"
          aria-label="Upload files - drag and drop or click to browse"
          tabIndex={0}
          className={cn(
            "glass-card p-4 sm:p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer",
            isDragActive
              ? "border-observatory-gold bg-observatory-gold/10"
              : "border-glass-border hover:border-observatory-gold/50"
          )}
        >
          <input {...getInputProps()} aria-label="File upload input" />
          {isDragActive ? (
            <>
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-observatory-gold animate-bounce" />
              <p className="text-xs sm:text-sm text-center text-observatory-gold font-medium">
                Drop files here...
              </p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-text-tertiary" />
              <p className="text-xs sm:text-sm text-center text-text-secondary font-medium mb-1">
                Drag & drop files or click to browse
              </p>
              <p className="text-[10px] sm:text-xs text-text-tertiary text-center">
                Images, videos, audio, sketches • Max {UPLOAD_LIMITS.MAX_FILE_SIZE.DEFAULT / (1024 * 1024)}MB per file • Max {UPLOAD_LIMITS.MAX_FILES} files
              </p>
            </>
          )}
        </div>

        {/* Action Buttons - Native Camera/Audio */}
        <div className="grid grid-cols-2 gap-2">
          <CameraCapture
            mode="photo"
            onCapture={handleMediaCapture}
          />
          <AudioRecorder
            onRecordingComplete={handleMediaCapture}
          />
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div
            className="glass-card p-3 border border-observatory-gold/30 animate-pulse"
            role="status"
            aria-live="polite"
            aria-label="Processing files"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-observatory-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-observatory-gold font-medium">
                Processing files...
              </span>
            </div>
          </div>
        )}

        {/* File List with Thumbnails */}
        {files.length > 0 && (
          <div
            className="glass-card p-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar"
            role="list"
            aria-label={`${files.length} file${files.length > 1 ? 's' : ''} selected`}
          >
            {files.map((file) => {
              const isImage = file.type.startsWith('image/');
              const isAudio = file.type.startsWith('audio/');
              const hasPreview = file.preview && isImage;

              // FIX: Better upload state detection
              const isCurrentlyUploading = file.progress?.uploadStarted && !file.progress?.uploadComplete;

              return (
                <div
                  key={file.id}
                  role="listitem"
                  tabIndex={0}
                  className="flex items-center gap-3 p-2 rounded-lg bg-space-deep/20 hover:bg-space-deep/30 transition-all group"
                  onKeyDown={(e) => {
                    // Keyboard navigation: Delete = remove file
                    if (e.key === 'Delete' && !isCurrentlyUploading) {
                      removeFile(file.id);
                    }
                  }}
                  aria-label={`${file.name}, ${formatFileSize(file.size)}${isCurrentlyUploading ? `, uploading ${file.progress?.percentage}%` : ''}`}
                >
                  {/* Thumbnail or Icon - Responsive & Clickable */}
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded overflow-hidden bg-space-deep/40 flex items-center justify-center",
                      hasPreview && "cursor-pointer hover:ring-2 hover:ring-observatory-gold transition-all"
                    )}
                    onClick={() => {
                      if (hasPreview) {
                        const fileIndex = files.findIndex(f => f.id === file.id);
                        setPreviewModalIndex(fileIndex);
                      }
                    }}
                    role={hasPreview ? "button" : undefined}
                    aria-label={hasPreview ? `Preview ${file.name}` : undefined}
                  >
                    {hasPreview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-observatory-gold text-sm sm:text-base">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info - Responsive text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-text-primary truncate" title={file.name}>
                      {file.name.replace(/\.(webm|ogg|mp3|wav|m4a)$/i, '')}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] sm:text-xs text-text-tertiary">
                        {formatFileSize(file.size)}
                      </p>
                      {/* Show ETA during upload */}
                      {isCurrentlyUploading && uploadETA && (
                        <p className="text-[10px] sm:text-xs text-observatory-gold font-medium">
                          {uploadETA}
                        </p>
                      )}
                    </div>
                    {/* Individual Progress */}
                    {isCurrentlyUploading && file.progress && (
                      <div className="mt-1 w-full bg-space-deep/30 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-observatory-gold h-full transition-all duration-300"
                          style={{ width: `${file.progress.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Play/Pause for Audio - Touch-friendly */}
                    {isAudio && !isCurrentlyUploading && (
                      <button
                        type="button"
                        onClick={() => toggleAudioPlayback(file)}
                        className={cn(
                          "p-2 sm:p-1.5 rounded transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center",
                          playingAudioId === file.id
                            ? "bg-observatory-gold/20 text-observatory-gold"
                            : "hover:bg-observatory-gold/10 text-observatory-gold/70 hover:text-observatory-gold"
                        )}
                        aria-label={playingAudioId === file.id ? `Pause ${file.name}` : `Play ${file.name}`}
                        title={playingAudioId === file.id ? "Pause" : "Play"}
                      >
                        {playingAudioId === file.id ? (
                          <Pause className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Status: Progress % / Success / Error / Remove */}
                    {isCurrentlyUploading && file.progress ? (
                      // Currently uploading - show progress %
                      <div className="text-xs text-observatory-gold font-medium min-w-[35px] text-right">
                        {file.progress.percentage}%
                      </div>
                    ) : (
                      // Not uploading - show status icons + remove button
                      <div className="flex items-center gap-1">
                        {file.error ? (
                          // Upload failed - show error icon and retry button
                          <>
                            <AlertCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-400" title={file.error} />
                            <button
                              type="button"
                              onClick={() => {
                                if (uppyRef.current) {
                                  uppyRef.current.retryUpload(file.id);
                                }
                              }}
                              className="p-2 sm:p-1.5 rounded hover:bg-yellow-400/20 text-yellow-400 hover:text-yellow-300 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                              aria-label={`Retry upload ${file.name}`}
                              title="Retry upload"
                            >
                              <RotateCw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </>
                        ) : file.progress?.uploadComplete ? (
                          // Upload successful - show checkmark
                          <CheckCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-green-400" title="Upload successful" />
                        ) : null}

                        {/* Remove button - always visible when not uploading */}
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="p-2 sm:p-1.5 rounded hover:bg-red-400/20 text-red-400 hover:text-red-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                          aria-label={`Remove ${file.name}`}
                          title="Remove file"
                        >
                          <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Cancel Upload (only when uploading) */}
        {isUploading && (
          <button
            type="button"
            onClick={cancelUpload}
            className="w-full glass-card p-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
            aria-label="Cancel all uploads"
          >
            Cancel Upload
          </button>
        )}

        {/* Hidden Audio Element */}
        <audio ref={audioRef} className="hidden" />

        {/* Preview Modal */}
        {previewModalIndex !== null && (
          <MediaPreviewModal
            files={files.filter(f => f.preview)} // Only previewable files
            currentIndex={previewModalIndex}
            onClose={() => setPreviewModalIndex(null)}
            onNext={() => {
              const previewableFiles = files.filter(f => f.preview);
              const nextIndex = (previewModalIndex + 1) % previewableFiles.length;
              setPreviewModalIndex(nextIndex);
            }}
            onPrevious={() => {
              const previewableFiles = files.filter(f => f.preview);
              const prevIndex = (previewModalIndex - 1 + previewableFiles.length) % previewableFiles.length;
              setPreviewModalIndex(prevIndex);
            }}
          />
        )}
      </div>
    );
  }
);

UppyFileUpload.displayName = 'UppyFileUpload';
