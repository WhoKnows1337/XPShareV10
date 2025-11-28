'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Tag, MessageSquare, MapPin, Calendar, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * MatchExplanation - Phase 3, Task 3.1
 *
 * Shows why an experience matches with expandable details.
 * Displays match reasons with confidence scores.
 *
 * @see docs/maindocs/xpresultsv2/04-components-spec.md - Section 8
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 3, Task 3.1
 */

export interface MatchReason {
  type: 'category' | 'keywords' | 'location' | 'temporal' | 'user';
  label: string;
  confidence: number; // 0-100
  details?: string;
}

interface MatchExplanationProps {
  reasons: MatchReason[];
  overallScore: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const reasonIcons: Record<MatchReason['type'], React.ReactNode> = {
  category: <Tag className="h-4 w-4" />,
  keywords: <MessageSquare className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />,
  temporal: <Calendar className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
};

export function MatchExplanation({
  reasons,
  overallScore,
  isExpanded: controlledExpanded,
  onToggle,
}: MatchExplanationProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggle = onToggle || (() => setInternalExpanded(!internalExpanded));

  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="mt-2">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group w-full"
      >
        <span>Why this matches</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
        <span className="text-primary font-medium">{overallScore}%</span>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 pl-2 border-l-2 border-primary/20">
              {reasons.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 text-primary">
                      {reasonIcons[reason.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">
                          {reason.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {reason.confidence}%
                        </span>
                      </div>
                      <Progress value={reason.confidence} className="h-1 mt-1" />
                      {reason.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {reason.details}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
