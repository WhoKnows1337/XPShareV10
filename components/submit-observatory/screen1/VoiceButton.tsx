'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface VoiceButtonProps {
  onTranscript: (transcript: string) => void;
}

export function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const t = useTranslations('submit.screen1.voice');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check if browser supports voice recording
  const isSupported = typeof window !== 'undefined' && 'mediaDevices' in navigator;

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (!isSupported) {
      toast.error(t('notSupported', 'Voice recording is not supported in your browser'));
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
          toast.success(t('success', 'Voice transcribed successfully!'));
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error(t('error', 'Failed to transcribe audio'));
        } finally {
          setIsProcessing(false);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success(t('recording', 'Recording started...'));
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error(t('permissionError', 'Microphone permission denied'));
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

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`
        flex items-center gap-2 px-5 py-3 rounded-lg
        font-mono text-sm font-medium tracking-wide
        transition-all duration-200
        ${
          isRecording
            ? 'bg-observatory-gold/15 border-observatory-gold/40 text-observatory-gold'
            : 'bg-text-primary/5 border-text-primary/20 text-text-secondary hover:bg-text-primary/8 hover:border-text-primary/30'
        }
        border
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
      `}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('processing', 'Processing...')}</span>
        </>
      ) : isRecording ? (
        <>
          <MicOff className="w-4 h-4" />
          <span>{t('stop', 'Stop Recording')}</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          <span>{t('start', '🎤 Diktat')}</span>
        </>
      )}
    </button>
  );
}
