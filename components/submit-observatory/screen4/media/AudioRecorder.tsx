'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, X, Square } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  className?: string;
}

export const AudioRecorder = ({
  onRecordingComplete,
  className
}: AudioRecorderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      streamRef.current = stream;

      // Setup audio analyser for waveform
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualizing audio levels
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255); // Normalize to 0-1
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const timestamp = new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        }).replace(':', '-');
        const extension = mimeType === 'audio/webm' ? 'webm' : 'ogg';
        const file = new File([blob], `Audio Recording ${timestamp}.${extension}`, {
          type: mimeType
        });
        onRecordingComplete(file);
        chunksRef.current = [];

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        setIsOpen(false);
        setRecordingTime(0);
        setAudioLevel(0);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Microphone access denied. Please check permissions.');
    }
  }, [onRecordingComplete]);

  // Stop Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  // Cancel Recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop without triggering onstop callback
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      chunksRef.current = [];

      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setRecordingTime(0);
      setAudioLevel(0);
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  }, [isRecording]);

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
        <Mic className="w-4 h-4 text-observatory-gold group-hover:scale-110 transition-transform" />
        <span className="text-text-secondary">Record Audio</span>
      </button>

      <Dialog open={isOpen} onOpenChange={cancelRecording}>
        <DialogContent className="glass-card max-w-md">
          <VisuallyHidden>
            <DialogTitle>Audio Recording</DialogTitle>
          </VisuallyHidden>

          <div className="space-y-6 p-6">
            {/* Title */}
            <h3 className="text-xl font-semibold text-text-primary text-center">
              Audio Recording
            </h3>

            {/* Waveform Visualization */}
            <div className="flex items-center justify-center h-32 relative">
              <div
                className="w-2 bg-observatory-gold rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(10, audioLevel * 120)}px`,
                }}
              />
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-observatory-gold rounded-full animate-ping opacity-20" />
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-4xl font-mono text-observatory-gold">
                {formatTime(recordingTime)}
              </p>
              <p className="text-sm text-text-tertiary mt-2">
                {isRecording ? 'Recording...' : 'Ready to record'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-card-accent p-4 rounded-lg border border-red-500/30">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-observatory-gold/20 border-4 border-observatory-gold hover:bg-observatory-gold/30 transition-all flex items-center justify-center"
                  title="Start recording"
                >
                  <Mic className="w-6 h-6 text-observatory-gold" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-500/20 border-4 border-red-500 hover:bg-red-500/30 transition-all flex items-center justify-center"
                  title="Stop and save recording"
                >
                  <Square className="w-6 h-6 text-red-500 fill-current" />
                </button>
              )}
            </div>

            {/* Cancel Button */}
            <button
              onClick={cancelRecording}
              className="w-full p-2 text-sm text-text-tertiary hover:text-text-secondary transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {isRecording ? 'Cancel Recording' : 'Close'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
