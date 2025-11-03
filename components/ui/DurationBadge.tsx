import { Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils/media-metadata';
import { cn } from '@/lib/utils';

interface DurationBadgeProps {
  /** Duration in seconds */
  duration: number | null | undefined;
  /** Optional className for styling */
  className?: string;
  /** Variant for different contexts */
  variant?: 'default' | 'compact' | 'overlay';
}

/**
 * Reusable duration badge component for video/audio media
 * Displays formatted duration (e.g., "1:23", "12:34:56")
 */
export function DurationBadge({ duration, className, variant = 'default' }: DurationBadgeProps) {
  if (!duration || duration <= 0) {
    return null;
  }

  const formattedDuration = formatDuration(duration);

  const baseStyles = 'flex items-center gap-1 font-mono';

  const variantStyles = {
    default: 'px-2 py-1 rounded-md bg-background-tertiary text-text-secondary text-xs',
    compact: 'text-xs text-text-secondary',
    overlay: 'absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs backdrop-blur-sm',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      <Clock className="w-3 h-3" />
      <span>{formattedDuration}</span>
    </div>
  );
}
