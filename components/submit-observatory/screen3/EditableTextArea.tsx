'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { TextSegment } from '@/lib/utils/text-diff';

interface EditableTextAreaProps {
  text: string;
  segments: TextSegment[];
  onChange: (newText: string) => void;
  onBlur?: () => void;
  className?: string;
  minHeight?: number;
}

/**
 * Editable textarea with segment highlight overlay
 *
 * Uses a dual-layer approach:
 * - Bottom layer: textarea for actual text editing
 * - Top layer: transparent overlay showing segment highlights
 *
 * Both layers are kept in sync for proper visual feedback
 */
export function EditableTextArea({
  text,
  segments,
  onChange,
  onBlur,
  className = '',
  minHeight = 300,
}: EditableTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  const [localText, setLocalText] = useState(text);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local text with props (only when changed externally, not from our own updates)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setLocalText(text);
    }
    isInternalUpdate.current = false;
  }, [text]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        minHeight
      )}px`;
    }
  }, [localText, minHeight]);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    isInternalUpdate.current = true;
    setLocalText(newText);
    onChange(newText);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  /**
   * Render highlighted text overlay
   * Maps segments to spans with appropriate styling
   */
  const renderHighlightedText = () => {
    console.log('[EditableTextArea] renderHighlightedText called:', {
      hasSegments: !!segments,
      segmentsLength: segments?.length || 0,
      segments: segments
    });

    if (!segments || segments.length === 0) {
      console.warn('[EditableTextArea] No segments to render!');
      return <span className="whitespace-pre-wrap">{localText}</span>;
    }

    return (
      <span className="whitespace-pre-wrap">
        {segments.map((segment) => {
          const isAIAdded = segment.type === 'ai-added';
          const isUserEdited = segment.type === 'user-edited';
          const isRemoved = segment.text === '';

          if (isRemoved) return null;

          const highlightClass = [
            isAIAdded && 'bg-observatory-gold/20 border-b-2 border-observatory-gold',
            isUserEdited && 'bg-blue-500/20 border-b-2 border-blue-500',
          ]
            .filter(Boolean)
            .join(' ');

          if (highlightClass) {
            return (
              <span key={segment.id} className={highlightClass}>
                {segment.text}
              </span>
            );
          }

          return <span key={segment.id}>{segment.text}</span>;
        })}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Highlight Overlay - Visual only */}
      <div
        ref={highlightRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          paddingTop: '1.25rem',
          paddingRight: '1.25rem',
          paddingBottom: '1.25rem',
          paddingLeft: '1.25rem',
        }}
      >
        <div
          className="text-base leading-relaxed font-mono text-transparent select-none"
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {renderHighlightedText()}
        </div>
      </div>

      {/* Actual Textarea - Editable */}
      <textarea
        ref={textareaRef}
        value={localText}
        onChange={handleChange}
        onScroll={handleScroll}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          relative z-10 w-full p-5
          bg-transparent
          text-text-primary text-base leading-relaxed font-mono
          border border-glass-border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-observatory-gold/50
          resize-none overflow-auto
        `}
        style={{
          minHeight: `${minHeight}px`,
          caretColor: '#f0f0f0', // Visible cursor
        }}
        placeholder="Schreibe deinen Text hier..."
        spellCheck={false}
      />

      {/* Character count */}
      <div className="mt-2 text-xs text-text-tertiary text-right">
        {localText.length} Zeichen
      </div>

      {/* Edit Mode Indicator */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-2 right-2 z-20"
        >
          <div className="px-2 py-1 bg-observatory-gold/20 border border-observatory-gold/40 rounded text-xs text-observatory-gold font-medium">
            ✏️ Editieren...
          </div>
        </motion.div>
      )}
    </div>
  );
}
