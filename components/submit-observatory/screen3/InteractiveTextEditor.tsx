'use client';

import { useState, useRef, useCallback } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentTooltip } from './SegmentTooltip';
import { EditableTextArea } from './EditableTextArea';
import type { TextSegment } from '@/lib/utils/text-diff';

interface TooltipState {
  segment: TextSegment;
  position: { x: number; y: number };
}

interface InteractiveTextEditorProps {
  onTextChange?: (text: string) => void;
  onTextBlur?: () => void;
}

export function InteractiveTextEditor({ onTextChange, onTextBlur }: InteractiveTextEditorProps = {}) {
  const t = useTranslations('submit.screen3.editor');
  const { screen1, screen3, removeSegment, undo, setCurrentText } = useSubmitFlowStore();

  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedText, setEditedText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Get display text based on enhancement state
  const displayText = screen3.enhancementEnabled && screen3.enhancedText
    ? screen3.enhancedText
    : screen1.text;

  // Use current text from store if available, otherwise fallback
  const currentText = screen3.textVersions?.current || displayText;

  // Use segments if available, otherwise fall back to simple display
  const hasSegments = screen3.segments && screen3.segments.length > 0;

  const handleSegmentClick = useCallback((segment: TextSegment, event: React.MouseEvent) => {
    if (segment.type !== 'ai-added') return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      segment,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    });
  }, []);

  const handleSegmentHover = useCallback((segmentId: string | null) => {
    setHoveredSegmentId(segmentId);
  }, []);

  const handleRemoveSegment = useCallback(() => {
    if (tooltip) {
      removeSegment(tooltip.segment.id);
      setTooltip(null);
      setHoveredSegmentId(null);
    }
  }, [tooltip, removeSegment]);

  const handleUndo = useCallback(() => {
    const success = undo();
    if (success) {
      setTooltip(null);
      setHoveredSegmentId(null);
    }
  }, [undo]);

  // Edit Mode Handlers
  const enterEditMode = useCallback(() => {
    setEditedText(currentText);
    setIsEditMode(true);
    setTooltip(null); // Close any open tooltips
  }, [currentText]);

  const handleTextEdit = useCallback((newText: string) => {
    setEditedText(newText);
    // Trigger change detection callback
    if (onTextChange) {
      onTextChange(newText);
    }
  }, [onTextChange]);

  const handleTextEditBlur = useCallback(() => {
    if (onTextBlur) {
      onTextBlur();
    }
  }, [onTextBlur]);

  const saveEdit = useCallback(() => {
    setCurrentText(editedText);
    setIsEditMode(false);
    // Trigger final change detection
    if (onTextChange) {
      onTextChange(editedText);
    }
    if (onTextBlur) {
      onTextBlur();
    }
  }, [editedText, setCurrentText, onTextChange, onTextBlur]);

  const cancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditedText('');
  }, []);

  // Render segments as interactive elements
  const renderSegments = () => {
    if (!hasSegments) {
      // Fallback: Simple display
      return <div className="whitespace-pre-wrap leading-relaxed">{displayText}</div>;
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {screen3.segments.map((segment) => {
          const isAIAdded = segment.type === 'ai-added';
          const isUserEdited = segment.type === 'user-edited';
          const isHovered = hoveredSegmentId === segment.id;
          const isRemoved = segment.text === ''; // Check if segment was removed

          if (isRemoved) return null;

          const className = [
            'inline',
            isAIAdded && 'bg-observatory-gold/20 border-b-2 border-observatory-gold cursor-pointer hover:bg-observatory-gold/30 transition-all',
            isUserEdited && 'bg-blue-500/20 border-b-2 border-blue-500 cursor-pointer hover:bg-blue-500/30 transition-all',
            isHovered && 'bg-observatory-gold/40',
          ].filter(Boolean).join(' ');

          if (isAIAdded || isUserEdited) {
            return (
              <motion.span
                key={segment.id}
                className={className}
                onClick={(e) => handleSegmentClick(segment, e)}
                onMouseEnter={() => handleSegmentHover(segment.id)}
                onMouseLeave={() => handleSegmentHover(null)}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                title={`${segment.source?.label || 'AI Enhancement'} - Click for options`}
              >
                {segment.text}
              </motion.span>
            );
          }

          // Original text segments
          return <span key={segment.id}>{segment.text}</span>;
        })}
      </div>
    );
  };

  // Count AI segments
  const aiSegmentsCount = hasSegments
    ? screen3.segments.filter(s => s.type === 'ai-added' && s.text !== '').length
    : screen3.highlights?.length || 0;

  const canUndo = screen3.undoStack && screen3.undoStack.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Mode Toggle Button */}
      {!isEditMode && (
        <div className="absolute top-3 right-3 z-10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={enterEditMode}
              variant="outline"
              size="sm"
              className="text-xs bg-space-deep/80 backdrop-blur-sm"
            >
              <Edit3 className="w-3 h-3 mr-1.5" />
              Text bearbeiten
            </Button>
          </motion.div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditMode ? (
        <div className="space-y-3">
          <EditableTextArea
            text={editedText}
            segments={screen3.segments}
            onChange={handleTextEdit}
            onBlur={handleTextEditBlur}
            minHeight={300}
          />

          {/* Edit Mode Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button onClick={cancelEdit} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1.5" />
              Abbrechen
            </Button>
            <Button
              onClick={saveEdit}
              variant="default"
              size="sm"
              className="bg-observatory-gold hover:bg-observatory-gold/80 text-space-deep"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Speichern
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* View Mode - Text Display */}
          <div
            className="p-5 bg-space-deep/60 border border-glass-border rounded-lg
                       text-text-primary text-base leading-relaxed
                       min-h-[300px]"
          >
            <AnimatePresence mode="wait">
              {renderSegments()}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* View Mode Only - Enhancement Legend & Info */}
      {!isEditMode && (
        <>
          {/* Enhancement Legend */}
          {screen3.enhancementEnabled && aiSegmentsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6 mt-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-observatory-gold/20 border-b-2 border-observatory-gold rounded-sm" />
                <span className="text-text-tertiary">{t('legend.added', 'AI hinzugefügt')}</span>
              </div>

              <div className="ml-auto text-text-tertiary text-xs flex items-center gap-3">
                <span>
                  {aiSegmentsCount} {aiSegmentsCount === 1 ? 'Änderung' : 'Änderungen'}
                </span>

                {canUndo && (
                  <button
                    onClick={handleUndo}
                    className="text-observatory-gold hover:text-observatory-gold/80 transition-colors underline"
                  >
                    ↶ Undo
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* No Enhancement Info */}
          {!screen3.enhancementEnabled && (
            <div className="mt-3 text-xs text-text-tertiary flex items-center gap-2">
              <span>💡</span>
              <span>Aktiviere den AI-Button um deinen Text mit zusätzlichen Details zu ergänzen</span>
            </div>
          )}

          {/* Tooltip */}
          {tooltip && (
            <SegmentTooltip
              segment={tooltip.segment}
              position={tooltip.position}
              onRemove={handleRemoveSegment}
              onClose={() => setTooltip(null)}
            />
          )}

          {/* Keyboard hint */}
          {hasSegments && aiSegmentsCount > 0 && (
            <div className="mt-2 text-xs text-text-tertiary/60 text-center">
              💡 Tip: Click on gold text to remove AI additions or click "Text bearbeiten" to edit
            </div>
          )}
        </>
      )}
    </div>
  );
}
