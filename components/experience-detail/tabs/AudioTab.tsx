'use client';

import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface AudioItem {
  id: string;
  url: string;
  type: string;
  caption?: string;
  duration?: number;
}

interface AudioTabProps {
  audio: AudioItem[];
}

/**
 * Audio Tab Component
 * Displays audio files with custom player UI
 */
export function AudioTab({ audio }: AudioTabProps) {
  if (audio.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground space-y-2">
          <Music className="h-12 w-12 mx-auto opacity-20" />
          <p className="text-sm">No audio files attached</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {audio.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50 hover:border-border transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Music className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Caption */}
                  {item.caption && (
                    <h4 className="font-medium text-sm truncate">
                      {item.caption}
                    </h4>
                  )}

                  {/* Audio Player */}
                  <audio
                    controls
                    src={item.url}
                    className="w-full h-10"
                    preload="metadata"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
