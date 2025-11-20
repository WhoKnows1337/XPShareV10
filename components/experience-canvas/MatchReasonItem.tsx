'use client';

import { CheckCircle, MapPin, Clock, Tag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type MatchReasonType = 'category' | 'location' | 'temporal' | 'semantic' | 'keywords';

interface MatchReasonItemProps {
  type: MatchReasonType;
  label: string;
  value: string;
  strength: number; // 0-100
  index?: number;
}

export function MatchReasonItem({ type, label, value, strength, index = 0 }: MatchReasonItemProps) {
  const iconConfig = {
    category: { icon: Sparkles, color: 'text-purple-400' },
    location: { icon: MapPin, color: 'text-blue-400' },
    temporal: { icon: Clock, color: 'text-orange-400' },
    semantic: { icon: Tag, color: 'text-green-400' },
    keywords: { icon: Tag, color: 'text-pink-400' },
  };

  const { icon: Icon, color } = iconConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
    >
      <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs font-medium">{label}</p>
          <div className="flex items-center gap-1">
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strength}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
            <span className="text-xs text-muted-foreground">{strength}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate">{value}</p>
      </div>
    </motion.div>
  );
}
