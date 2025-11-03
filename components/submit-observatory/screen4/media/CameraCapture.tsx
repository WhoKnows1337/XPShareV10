'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, X, FlipHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  mode?: 'photo' | 'video';
  className?: string;
}

export const CameraCapture = ({
  onCapture,
  mode = 'photo',
  className
}: CameraCaptureProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: mode === 'video',
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access denied. Please check permissions.');
    }
  }, [facingMode, mode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsOpen(false);
    setError(null);
  }, [stream]);

  // Take Photo
  const takePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          onCapture(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  }, [onCapture, stopCamera]);

  // Start Video Recording
  const startRecording = useCallback(() => {
    if (!stream) return;

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, {
          type: 'video/webm'
        });
        onCapture(file);
        chunksRef.current = [];
        stopCamera();
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start video recording.');
    }
  }, [stream, onCapture, stopCamera]);

  // Stop Video Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Flip Camera (Front/Back)
  const flipCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  // Auto-start camera when dialog opens
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [startCamera, stopCamera]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "glass-card-accent p-3 rounded-lg hover:bg-space-deep/40 transition-all flex items-center justify-center gap-2 text-xs group",
          className
        )}
      >
        <Camera className="w-4 h-4 text-observatory-gold group-hover:scale-110 transition-transform" />
        <span className="text-text-secondary">
          {mode === 'photo' ? 'Camera' : 'Record Video'}
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="glass-card max-w-4xl p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>
              {mode === 'photo' ? 'Take Photo' : 'Record Video'}
            </DialogTitle>
          </VisuallyHidden>

          {/* Video Preview */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={mode === 'photo'}
              className="w-full h-auto max-h-[70vh]"
            />

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 px-3 py-1 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="glass-card p-6 max-w-md text-center">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-observatory-gold/20 hover:bg-observatory-gold/30 border border-observatory-gold rounded-lg text-text-primary transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="glass-card p-4 flex items-center justify-between">
            <button
              onClick={stopCamera}
              className="p-2 rounded-full hover:bg-red-500/20 transition-all"
              title="Close"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>

            <div className="flex items-center gap-3">
              {mode === 'photo' ? (
                <button
                  onClick={takePhoto}
                  disabled={!stream || !!error}
                  className="w-16 h-16 rounded-full border-4 border-observatory-gold bg-observatory-gold/20 hover:bg-observatory-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Take photo"
                />
              ) : (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!stream || !!error}
                  className={cn(
                    "w-16 h-16 rounded-full border-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    isRecording
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-observatory-gold bg-observatory-gold/20 hover:bg-observatory-gold/30'
                  )}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording && (
                    <div className="w-6 h-6 bg-red-500 mx-auto rounded" />
                  )}
                </button>
              )}
            </div>

            <button
              onClick={flipCamera}
              disabled={isRecording || !stream}
              className="p-2 rounded-full hover:bg-space-deep/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Flip camera"
            >
              <FlipHorizontal className="w-5 h-5 text-observatory-gold" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
