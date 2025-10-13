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
    }, 30000); // 30 seconds

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
      <div className="absolute left-3 top-3 pointer-events-none z-10">
        <span className="font-mono text-[10px] text-text-monospace uppercase tracking-wider">
          ENTRY.TXT
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[220px] bg-space-deep/80 border border-text-primary/20 rounded-lg
                   px-4 pt-10 pb-4 text-text-primary text-base leading-relaxed
                   resize-none outline-none transition-all duration-300
                   placeholder:text-text-primary/30
                   focus:border-observatory-gold/50 focus:shadow-[0_0_0_3px_rgba(212,165,116,0.1),0_4px_12px_rgba(0,0,0,0.4)]
                   focus:animate-pulse-glow
                   hover:border-text-primary/30 hover:shadow-[0_0_8px_rgba(212,165,116,0.15)]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(232, 220, 192, 0.2) rgba(15, 20, 25, 0.5)',
        }}
      />
    </div>
  );
}
