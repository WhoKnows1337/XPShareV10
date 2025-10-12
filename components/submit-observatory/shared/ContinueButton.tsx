'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface ContinueButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  loading?: boolean;
}

export function ContinueButton({
  onClick,
  disabled = false,
  label = 'Continue →',
  loading = false,
}: ContinueButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render on client after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <button
        disabled
        className="btn-observatory flex items-center gap-2 group opacity-50"
      >
        <span>{label}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-observatory flex items-center gap-2 group"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-space-deep border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
