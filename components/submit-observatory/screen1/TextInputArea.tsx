'use client';

import { useEffect, useRef } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';

interface TextInputAreaProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export function TextInputArea({ value, onChange, placeholder }: TextInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveDraft } = useSubmitFlowStore();

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (value.trim()) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [value, saveDraft]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="relative">
      {/* ENTRY.TXT Label */}
      <div className="absolute left-3 top-2 pointer-events-none z-10">
        <span className="font-mono text-[9px] text-text-monospace uppercase tracking-wider">
          ENTRY.TXT
        </span>
      </div>

      {/* Textarea - Compact */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[180px] bg-space-mid/90 border border-glass-border rounded-md
                   px-3 pt-8 pb-3 text-text-primary text-sm leading-relaxed
                   resize-none outline-none transition-all duration-200
                   placeholder:text-text-tertiary/40
                   focus:border-observatory-accent/40 focus:shadow-[0_0_0_2px_rgba(139,157,195,0.1)]
                   hover:border-glass-border hover:shadow-[0_2px_8px_rgba(139,157,195,0.08)]
                   custom-scrollbar"
      />
    </div>
  );
}
