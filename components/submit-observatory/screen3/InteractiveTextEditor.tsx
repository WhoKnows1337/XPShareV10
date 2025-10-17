'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { SegmentTooltip } from './SegmentTooltip';
import { AIHighlight } from './extensions/AIHighlight';
import type { TextSegment } from '@/lib/utils/text-diff';

interface TooltipState {
  segment: TextSegment;
  position: { x: number; y: number };
}

interface InteractiveTextEditorProps {
  onTextChange?: (text: string) => void;
  onTextBlur?: () => void;
}

/**
 * Convert segments to Tiptap JSON format with marks
 */
function segmentsToTiptapJSON(segments: TextSegment[]): any {
  if (!segments || segments.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    };
  }

  // Group segments into paragraphs based on newlines
  const content: any[] = [];
  let currentParagraph: any[] = [];

  for (const segment of segments) {
    if (segment.text === '') continue;

    const lines = segment.text.split('\n');

    lines.forEach((line, index) => {
      if (index > 0) {
        // Finish current paragraph and start a new one
        if (currentParagraph.length > 0) {
          content.push({
            type: 'paragraph',
            content: currentParagraph,
          });
        }
        currentParagraph = [];
      }

      if (line.length === 0) return;

      const textNode: any = {
        type: 'text',
        text: line,
      };

      // Add marks for AI-added or user-edited segments
      if (segment.type === 'ai-added' || segment.type === 'user-edited') {
        textNode.marks = [
          {
            type: 'aiHighlight',
            attrs: {
              segmentId: segment.id,
              type: segment.type,
              sourceType: segment.source?.type || null,
              sourceKey: segment.source?.key || null,
              sourceLabel: segment.source?.label || null,
              sourceValue: segment.source?.value ? String(segment.source.value) : null,
              questionText: segment.source?.questionText || null,
              confidence: segment.source?.confidence || null,
            },
          },
        ];
      }

      currentParagraph.push(textNode);
    });
  }

  // Add remaining paragraph
  if (currentParagraph.length > 0) {
    content.push({
      type: 'paragraph',
      content: currentParagraph,
    });
  }

  // Ensure at least one paragraph
  if (content.length === 0) {
    content.push({
      type: 'paragraph',
      content: [],
    });
  }

  return {
    type: 'doc',
    content,
  };
}

export function InteractiveTextEditor({ onTextChange, onTextBlur }: InteractiveTextEditorProps = {}) {
  const t = useTranslations('submit.screen3.editor');
  const { screen1, screen3, removeSegment, undo, setCurrentText } = useSubmitFlowStore();

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Get display text based on enhancement state
  const displayText = screen3.enhancementEnabled && screen3.enhancedText
    ? screen3.enhancedText
    : screen1.text;

  // Use current text from store if available, otherwise fallback
  const currentText = screen3.textVersions?.current || displayText;

  // Use segments if available
  const hasSegments = screen3.segments && screen3.segments.length > 0;

  // Initialize Tiptap editor
  const editor = useEditor({
    immediatelyRender: false, // ⭐ Fix SSR warning
    extensions: [
      StarterKit.configure({
        // Disable some formatting that we don't need
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        listItem: false,
        bulletList: false,
        orderedList: false,
        code: false,
        bold: false,
        italic: false,
        strike: false,
      }),
      AIHighlight, // ⭐ Our custom mark with inclusive: false and exitable: true
    ],
    content: hasSegments
      ? segmentsToTiptapJSON(screen3.segments)
      : {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: currentText ? [{ type: 'text', text: currentText }] : [],
            },
          ],
        },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none text-text-primary leading-relaxed min-h-[300px]',
      },
      handleClickOn: (view, pos, node, nodePos, event) => {
        // Handle clicks on AI highlights
        const target = event.target as HTMLElement;
        const highlightElement = target.closest('[data-ai-highlight]');

        if (highlightElement) {
          event.preventDefault();
          event.stopPropagation();

          // Extract segment data from attributes
          const segmentId = highlightElement.getAttribute('data-segment-id');
          const type = highlightElement.getAttribute('data-type') as 'ai-added' | 'user-edited';
          const sourceType = highlightElement.getAttribute('data-source-type') as 'attribute' | 'question' | null;
          const sourceKey = highlightElement.getAttribute('data-source-key');
          const sourceLabel = highlightElement.getAttribute('data-source-label');
          const sourceValue = highlightElement.getAttribute('data-source-value');
          const questionText = highlightElement.getAttribute('data-question-text');
          const confidenceStr = highlightElement.getAttribute('data-confidence');
          const confidence = confidenceStr ? parseFloat(confidenceStr) : undefined;

          if (!segmentId) return true;

          // Find segment in store
          const segment = screen3.segments?.find(s => s.id === segmentId);
          if (!segment) return true;

          // Show tooltip
          const rect = highlightElement.getBoundingClientRect();
          setTooltip({
            segment,
            position: {
              x: rect.left + rect.width / 2,
              y: rect.top,
            },
          });

          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setCurrentText(text);
      if (onTextChange) {
        onTextChange(text);
      }
    },
    onBlur: () => {
      if (onTextBlur) {
        onTextBlur();
      }
    },
  });

  // Update editor content when segments OR enhancement mode changes
  useEffect(() => {
    if (!editor) return;

    // ⭐ Skip first render - editor is already initialized with correct content
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // ⭐ Don't update if editor is focused (user is typing)
    if (editor.isFocused) {
      console.log('[InteractiveTextEditor] Skipping content update - editor is focused');
      return;
    }

    // Determine content based on enhancement state
    const newContent = hasSegments && screen3.enhancementEnabled
      ? segmentsToTiptapJSON(screen3.segments)
      : {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: displayText ? [{ type: 'text', text: displayText }] : [],
            },
          ],
        };

    // Only update if content actually changed
    const currentJSON = editor.getJSON();
    if (JSON.stringify(currentJSON) !== JSON.stringify(newContent)) {
      console.log('[InteractiveTextEditor] Updating content - enhancementEnabled:', screen3.enhancementEnabled);
      editor.commands.setContent(newContent);
    }
  }, [screen3.segments, hasSegments, screen3.enhancementEnabled, displayText, editor]);

  const handleRemoveSegment = useCallback(() => {
    if (tooltip) {
      removeSegment(tooltip.segment.id);
      setTooltip(null);
    }
  }, [tooltip, removeSegment]);

  const handleUndo = useCallback(() => {
    const success = undo();
    if (success) {
      setTooltip(null);
    }
  }, [undo]);

  // Count AI segments
  const aiSegmentsCount = hasSegments
    ? screen3.segments.filter(s => s.type === 'ai-added' && s.text !== '').length
    : screen3.highlights?.length || 0;

  const canUndo = screen3.undoStack && screen3.undoStack.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Tiptap Editor */}
      <div
        className="p-5 bg-space-deep/60 border border-glass-border rounded-lg
                   text-text-primary text-base leading-relaxed
                   min-h-[300px] cursor-text
                   focus-within:border-observatory-gold/50 focus-within:bg-space-deep/80
                   transition-all duration-200 tiptap-editor"
      >
        <EditorContent editor={editor} />
      </div>

      {/* Enhancement Legend & Info */}
      {screen3.enhancementEnabled && aiSegmentsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mt-4 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-observatory-gold/20 border-b-2 border-observatory-gold rounded-sm" />
            <span className="text-text-tertiary">{t('legend.added')}</span>
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
          💡 Tip: Klicke auf goldenen Text um KI-Ergänzungen zu entfernen
        </div>
      )}
    </div>
  );
}
