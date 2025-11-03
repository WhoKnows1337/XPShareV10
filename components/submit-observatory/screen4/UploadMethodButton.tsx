'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadMethodButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'active';
}

export function UploadMethodButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
}: UploadMethodButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg',
        'border-2 transition-all duration-200',
        'hover:scale-105 hover:shadow-md',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variant === 'default' && [
          'border-dashed border-observatory-gold/30 bg-black/20',
          'hover:border-observatory-gold/60 hover:bg-observatory-gold/5',
        ],
        variant === 'active' && [
          'border-solid border-observatory-gold bg-observatory-gold/10',
        ]
      )}
    >
      {/* Icon */}
      <Icon
        className={cn(
          'w-6 h-6 transition-colors',
          variant === 'default' && 'text-observatory-gold/60 group-hover:text-observatory-gold',
          variant === 'active' && 'text-observatory-gold'
        )}
      />

      {/* Label */}
      <span
        className={cn(
          'text-xs font-medium transition-colors',
          variant === 'default' && 'text-observatory-gold/60 group-hover:text-observatory-gold',
          variant === 'active' && 'text-observatory-gold'
        )}
      >
        {label}
      </span>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-lg bg-observatory-gold/0 group-hover:bg-observatory-gold/5 transition-colors pointer-events-none" />
    </button>
  );
}
