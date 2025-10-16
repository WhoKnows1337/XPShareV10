import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * Custom Tiptap Mark for AI-added and user-edited text segments
 *
 * Key properties:
 * - inclusive: false → Prevents mark from extending when typing at end
 * - exitable: true → Allows cursor to escape the mark with arrow keys
 *
 * This solves the cursor-trapping bug where new text was getting highlighted.
 */
export interface AIHighlightOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiHighlight: {
      /**
       * Set an AI highlight mark
       */
      setAIHighlight: (attributes: {
        segmentId: string;
        type: 'ai-added' | 'user-edited';
        sourceType?: 'attribute' | 'question';
        sourceKey?: string;
        sourceLabel?: string;
        sourceValue?: string;
        questionText?: string;
        confidence?: number;
      }) => ReturnType;
      /**
       * Remove an AI highlight mark
       */
      unsetAIHighlight: () => ReturnType;
    };
  }
}

export const AIHighlight = Mark.create<AIHighlightOptions>({
  name: 'aiHighlight',

  // ⭐ KEY PROPERTIES - Prevent cursor trapping
  inclusive: false,  // Prevents mark from extending when typing at end
  exitable: true,    // Allows cursor to escape with arrow keys

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      segmentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-segment-id'),
        renderHTML: attributes => {
          if (!attributes.segmentId) return {};
          return {
            'data-segment-id': attributes.segmentId,
          };
        },
      },
      type: {
        default: 'ai-added',
        parseHTML: element => element.getAttribute('data-type') || 'ai-added',
        renderHTML: attributes => {
          return {
            'data-type': attributes.type,
          };
        },
      },
      sourceType: {
        default: null,
        parseHTML: element => element.getAttribute('data-source-type'),
        renderHTML: attributes => {
          if (!attributes.sourceType) return {};
          return {
            'data-source-type': attributes.sourceType,
          };
        },
      },
      sourceKey: {
        default: null,
        parseHTML: element => element.getAttribute('data-source-key'),
        renderHTML: attributes => {
          if (!attributes.sourceKey) return {};
          return {
            'data-source-key': attributes.sourceKey,
          };
        },
      },
      sourceLabel: {
        default: null,
        parseHTML: element => element.getAttribute('data-source-label'),
        renderHTML: attributes => {
          if (!attributes.sourceLabel) return {};
          return {
            'data-source-label': attributes.sourceLabel,
          };
        },
      },
      sourceValue: {
        default: null,
        parseHTML: element => element.getAttribute('data-source-value'),
        renderHTML: attributes => {
          if (!attributes.sourceValue) return {};
          return {
            'data-source-value': attributes.sourceValue,
          };
        },
      },
      questionText: {
        default: null,
        parseHTML: element => element.getAttribute('data-question-text'),
        renderHTML: attributes => {
          if (!attributes.questionText) return {};
          return {
            'data-question-text': attributes.questionText,
          };
        },
      },
      confidence: {
        default: null,
        parseHTML: element => {
          const conf = element.getAttribute('data-confidence');
          return conf ? parseFloat(conf) : null;
        },
        renderHTML: attributes => {
          if (!attributes.confidence) return {};
          return {
            'data-confidence': attributes.confidence,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-ai-highlight]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-type'] || 'ai-added';

    // Apply different styles for ai-added vs user-edited
    const className = type === 'ai-added'
      ? 'ai-highlight-added'
      : 'ai-highlight-edited';

    return [
      'span',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-ai-highlight': '',
          class: className,
        }
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setAIHighlight:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetAIHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
