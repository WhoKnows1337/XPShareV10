'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LiveDiscoveryFeed } from './LiveDiscoveryFeed';
import { DiscoveryProgress } from './DiscoveryProgress';
import { RewardsUnlock } from './RewardsUnlock';
import { Button } from '@/components/ui/button';
import { DiscoveryEvent, DiscoveryResult } from './types';

interface DiscoveryLoadingScreenProps {
  experienceId: string;
  onComplete?: (result: DiscoveryResult) => void;
}

export function DiscoveryLoadingScreen({
  experienceId,
  onComplete,
}: DiscoveryLoadingScreenProps) {
  const router = useRouter();
  const [events, setEvents] = useState<DiscoveryEvent[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  const [autoRedirectIn, setAutoRedirectIn] = useState<number | null>(null);

  // Connect to Server-Sent Events stream
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/discovery/stream/${experienceId}`
    );

    eventSource.onmessage = (e) => {
      try {
        const event: DiscoveryEvent = JSON.parse(e.data);

        setEvents((prev) => [...prev, event]);

        // Update progress based on event type
        const progressMap: Record<string, number> = {
          saved: 10,
          embedding: 20,
          scanning: 40,
          similar_found: 60,
          wave_detected: 70,
          category_match: 80,
          location_cluster: 85,
          temporal_pattern: 90,
          complete: 100,
        };

        setProgress(progressMap[event.type] || progress);

        // Handle completion
        if (event.type === 'complete' && event.data) {
          setIsComplete(true);
          setResult(event.data as any);
          setShowRewards(true);

          // Start auto-redirect countdown
          setAutoRedirectIn(3);

          if (onComplete && event.data) {
            onComplete(event.data as any);
          }
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();

      // Fallback: redirect after timeout
      setTimeout(() => {
        handleContinue();
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [experienceId, onComplete]);

  // Auto-redirect countdown
  useEffect(() => {
    if (autoRedirectIn !== null && autoRedirectIn > 0) {
      const timer = setTimeout(() => {
        setAutoRedirectIn(autoRedirectIn - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirectIn === 0) {
      handleContinue();
    }
  }, [autoRedirectIn]);

  const handleContinue = useCallback(() => {
    router.push(`/experiences/${experienceId}?justPublished=true`);
  }, [router, experienceId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="text-6xl mb-4"
          >
            🌟
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-observatory-gold via-purple-400 to-blue-400 bg-clip-text text-transparent">
            {isComplete ? 'Discovery Complete!' : 'Analyzing Your Experience'}
          </h1>

          <p className="text-muted-foreground">
            {isComplete
              ? 'Found amazing connections in the XPShare network'
              : 'Searching for patterns and connections...'}
          </p>
        </motion.div>

        {/* Live Discovery Feed */}
        <LiveDiscoveryFeed events={events} />

        {/* Progress Bar */}
        <DiscoveryProgress progress={progress} isComplete={isComplete} />

        {/* Rewards Unlock */}
        {result?.rewards && (
          <RewardsUnlock rewards={result.rewards} show={showRewards} />
        )}

        {/* Continue Button */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full group bg-gradient-to-r from-observatory-gold to-purple-600 hover:from-observatory-gold/90 hover:to-purple-600/90"
            >
              <span>Continue to Your Experience</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            {autoRedirectIn !== null && autoRedirectIn > 0 && (
              <p className="text-sm text-muted-foreground">
                Auto-redirecting in {autoRedirectIn}s...
              </p>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {!isComplete && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4 border-4 border-observatory-gold border-t-transparent rounded-full"
            />
            <p className="text-muted-foreground">Initializing discovery...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
