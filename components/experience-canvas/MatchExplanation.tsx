'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from './ConfidenceBadge';
import { MatchReasonItem } from './MatchReasonItem';
import { ThumbsUp, ThumbsDown, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchReason {
  type: 'category' | 'location' | 'temporal' | 'semantic' | 'keywords';
  label: string;
  value: string;
  strength: number; // 0-100
}

interface MatchExplanationProps {
  experienceId: string;
  similarityScore: number; // 0-1 or 0-100
  reasons: MatchReason[];
  differences?: string[];
  compact?: boolean;
}

export function MatchExplanation({
  experienceId,
  similarityScore,
  reasons,
  differences = [],
  compact = false,
}: MatchExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | 'confused' | null>(null);

  // Normalize score to 0-100
  const normalizedScore = similarityScore > 1 ? similarityScore : Math.round(similarityScore * 100);

  // Determine confidence level
  const confidenceLevel: 'high' | 'medium' | 'low' =
    normalizedScore >= 75 ? 'high' : normalizedScore >= 50 ? 'medium' : 'low';

  const handleFeedback = (type: 'helpful' | 'not-helpful' | 'confused') => {
    setFeedback(type);
    // TODO: Send feedback to analytics
    console.log(`Match feedback for ${experienceId}:`, type);
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">Why this match?</CardTitle>
          <ConfidenceBadge level={confidenceLevel} score={normalizedScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toggle Button for Compact Mode */}
        {compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between text-xs"
          >
            <span>{isExpanded ? 'Hide details' : 'Show why we matched this'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Match Reasons */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Match Factors</p>
                {reasons.map((reason, index) => (
                  <MatchReasonItem
                    key={index}
                    type={reason.type}
                    label={reason.label}
                    value={reason.value}
                    strength={reason.strength}
                    index={index}
                  />
                ))}
              </div>

              {/* Differences (if any) */}
              {differences.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <p className="text-xs font-medium text-muted-foreground">Key Differences</p>
                  <div className="space-y-1">
                    {differences.map((diff, index) => (
                      <div
                        key={index}
                        className="text-xs text-muted-foreground p-2 bg-white/5 rounded"
                      >
                        • {diff}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Feedback Buttons */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-2">Was this match helpful?</p>
                <div className="flex gap-2">
                  <Button
                    variant={feedback === 'helpful' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback('helpful')}
                    className="flex-1 text-xs"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Yes
                  </Button>
                  <Button
                    variant={feedback === 'not-helpful' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback('not-helpful')}
                    className="flex-1 text-xs"
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    No
                  </Button>
                  <Button
                    variant={feedback === 'confused' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback('confused')}
                    className="flex-1 text-xs"
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Not Sure
                  </Button>
                </div>
                {feedback && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-400 mt-2 text-center"
                  >
                    Thank you for your feedback!
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
