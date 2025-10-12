'use client';

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
