'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TextSegment } from '@/lib/utils/text-diff';

interface SegmentTooltipProps {
  segment: TextSegment;
  position: { x: number; y: number };
  onRemove: () => void;
  onEdit?: () => void;
  onClose: () => void;
}

export function SegmentTooltip({ segment, position, onRemove, onEdit, onClose }: SegmentTooltipProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (segment.type !== 'ai-added' && segment.type !== 'user-edited') {
    return null; // Only show tooltip for editable segments
  }

  const handleRemove = () => {
    if (showConfirm) {
      onRemove();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const tooltipContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[9999] bg-space-deep border border-glass-border rounded-lg shadow-2xl p-3 max-w-xs"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-50%) translateY(-100%) translateY(-8px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Close tooltip"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-2 mb-3 pr-6">
          <Info className="w-4 h-4 text-observatory-gold mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-text-primary mb-1">
              {segment.type === 'ai-added' ? '🤖 KI Hinzugefügt' : '✏️ Von dir bearbeitet'}
            </h4>
            {segment.source && (
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1 text-observatory-gold">
                  {segment.source.type === 'question' ? '📍' : '🏷️'}
                  <span className="font-medium">{segment.source.label}</span>
                </div>
                {segment.source.questionText && (
                  <p className="text-text-tertiary">
                    Frage: "{segment.source.questionText}"
                  </p>
                )}
                {segment.source.value && (
                  <p className="text-text-secondary">
                    Deine Antwort: <span className="font-medium text-text-primary">"{segment.source.value}"</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Segment preview */}
        <div className="bg-space-deep/60 border border-glass-border/50 rounded p-2 mb-2">
          <p className="text-[10px] text-text-tertiary mb-1 uppercase tracking-wide">Hinzugefügter Text:</p>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
            "{segment.text}"
          </p>
        </div>

        {/* Explanation */}
        {segment.source && (
          <div className="mb-3 p-2 bg-observatory-gold/5 border border-observatory-gold/20 rounded">
            <p className="text-[10px] text-text-tertiary leading-relaxed">
              💡 Die KI hat diese Information aus {segment.source.type === 'question' ? 'deiner Antwort' : 'den erkannten Attributen'} in deinen Text integriert, um ihn vollständiger zu machen.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="text-xs h-7 flex-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant={showConfirm ? "destructive" : "outline"}
            onClick={handleRemove}
            className="text-xs h-7 flex-1"
          >
            <X className="w-3 h-3 mr-1" />
            {showConfirm ? 'Confirm?' : 'Remove'}
          </Button>
        </div>

        {/* Confidence indicator */}
        {segment.source?.type === 'attribute' && segment.source.confidence && (
          <div className="mt-2 pt-2 border-t border-glass-border/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">KI-Zuversicht</span>
              <span className="text-text-primary font-medium">
                {segment.source.confidence >= 90 ? '🟢 Hoch' :
                 segment.source.confidence >= 70 ? '🟡 Mittel' : '🟠 Niedrig'}
                {' '}({segment.source.confidence}%)
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  // Render as portal to avoid clipping by parent containers
  return typeof document !== 'undefined' ? createPortal(tooltipContent, document.body) : null;
}
