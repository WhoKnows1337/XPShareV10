import { Mark, mergeAttributes } from '@tiptap/core';

export interface TouchSegmentOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    touchSegment: {
      /**
       * Set a touch-optimized segment mark
       */
      setTouchSegment: (attributes?: { id?: string }) => ReturnType;
      /**
       * Toggle a touch-optimized segment mark
       */
      toggleTouchSegment: (attributes?: { id?: string }) => ReturnType;
      /**
       * Unset a touch-optimized segment mark
       */
      unsetTouchSegment: () => ReturnType;
    };
  }
}

/**
 * Touch-optimized segment mark extension
 * Adds mobile-friendly styling with 44px min-height touch targets
 */
export const TouchSegment = Mark.create<TouchSegmentOptions>({
  name: 'touchSegment',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-segment-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-segment-id': attributes.id,
          };
        },
      },
      source: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-source'),
        renderHTML: (attributes) => {
          if (!attributes.source) {
            return {};
          }

          return {
            'data-source': attributes.source,
          };
        },
      },
      confidence: {
        default: null,
        parseHTML: (element) => {
          const confidence = element.getAttribute('data-confidence');
          return confidence ? parseFloat(confidence) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.confidence) {
            return {};
          }

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
        tag: 'span[data-segment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'touch-segment min-h-[44px] inline-flex items-center px-2 py-2 rounded-md bg-accent-cyan/20 border-l-2 border-accent-cyan/60 cursor-pointer hover:bg-accent-cyan/30 transition-all touch-manipulation',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setTouchSegment:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleTouchSegment:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetTouchSegment:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
