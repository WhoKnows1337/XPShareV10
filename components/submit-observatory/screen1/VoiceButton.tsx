'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface VoiceButtonProps {
  onTranscript: (transcript: string) => void;
  isMobile?: boolean;
}

export function VoiceButton({ onTranscript, isMobile = false }: VoiceButtonProps) {
  const t = useTranslations('submit.screen1.voice');
  const [isMounted, setIsMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Only render on client after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Check if browser supports voice recording
  const isSupported = typeof window !== 'undefined' && 'mediaDevices' in navigator;

  const startRecording = async () => {
    if (!isSupported) {
      toast.error(t('notSupported'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Send to transcription API
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const data = await response.json();
          onTranscript(data.text);
          toast.success(t('success'));
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error(t('error'));
        } finally {
          setIsProcessing(false);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success(t('recording'));
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error(t('permissionError'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Don't render until mounted on client to avoid hydration mismatch
  if (!isMounted || !isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing}
      variant={isRecording ? "destructive" : "default"}
      size={isMobile ? "lg" : "sm"}
      className={isMobile ? "w-full text-base py-6" : "text-xs"}
    >
      {isProcessing ? (
        <>
          <Loader2 className={isMobile ? "w-5 h-5 animate-spin mr-2" : "w-3 h-3 animate-spin"} />
          {t('processing')}
        </>
      ) : isRecording ? (
        <>
          <MicOff className={isMobile ? "w-5 h-5 mr-2" : "w-3 h-3"} />
          {t('stop')}
        </>
      ) : (
        <>
          <Mic className={isMobile ? "w-5 h-5 mr-2" : "w-3 h-3"} />
          {t('start')}
        </>
      )}
    </Button>
  );
}
