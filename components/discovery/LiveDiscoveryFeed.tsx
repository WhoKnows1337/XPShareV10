'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles, TrendingUp, MapPin, Clock, Tag } from 'lucide-react';
import { DiscoveryEvent } from './types';

interface LiveDiscoveryFeedProps {
  events: DiscoveryEvent[];
}

const eventIcons: Record<string, React.ReactNode> = {
  saved: <Check className="w-4 h-4 text-green-400" />,
  embedding: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  scanning: <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />,
  similar_found: <Sparkles className="w-4 h-4 text-observatory-gold" />,
  wave_detected: <TrendingUp className="w-4 h-4 text-red-400" />,
  category_match: <Tag className="w-4 h-4 text-blue-400" />,
  location_cluster: <MapPin className="w-4 h-4 text-green-400" />,
  temporal_pattern: <Clock className="w-4 h-4 text-purple-400" />,
  complete: <Check className="w-4 h-4 text-green-400" />,
};

const eventMessages: Record<string, (data?: any) => string> = {
  saved: () => '✓ Experience saved successfully',
  embedding: () => '⚡ Generating semantic embedding...',
  scanning: (data) => `🔍 Scanning ${data?.count?.toLocaleString() || '12,847'} experiences`,
  similar_found: (data) => `✓ Found ${data?.count || 0} similar experiences`,
  wave_detected: () => '🌊 Active wave detected',
  category_match: (data) => `⚡ Category match: ${data?.count || 0} ${data?.category || 'reports'}`,
  location_cluster: (data) => `📍 Location cluster identified${data?.location ? ` in ${data.location}` : ''}`,
  temporal_pattern: (data) => `⏰ Temporal pattern: ${data?.timeframe || 'Peak activity detected'}`,
  complete: () => '✓ Analysis complete',
};

export function LiveDiscoveryFeed({ events }: LiveDiscoveryFeedProps) {
  return (
    <div className="glass-card p-4 space-y-2 h-[280px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <Sparkles className="w-4 h-4 text-observatory-gold" />
        <h3 className="font-semibold text-sm">Live Discovery Feed</h3>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {events.map((event, index) => (
            <motion.div
              key={`${event.type}-${index}`}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 text-sm"
            >
              <div className="shrink-0 mt-0.5">
                {eventIcons[event.type] || <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              <div className="flex-1">
                <p className="text-text-secondary leading-relaxed">
                  {eventMessages[event.type]?.(event.data) || event.type}
                </p>
                {event.data?.count !== undefined && event.type === 'similar_found' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-observatory-gold/20 text-observatory-gold rounded-full text-xs font-semibold"
                  >
                    <AnimatedCounter value={event.data.count} />
                    <span>matches</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
            <p>Initializing analysis...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Animated counter component
function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  );
}
