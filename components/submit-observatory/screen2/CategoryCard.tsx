'use client';

import { motion } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}

export function CategoryCard({ icon: Icon, name, value, selected, onClick }: CategoryCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center p-4 rounded-lg',
        'border-2 transition-all duration-200',
        'hover:bg-glass-bg/60 active:scale-95',
        selected
          ? 'border-observatory-accent bg-observatory-accent/10 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
          : 'border-glass-border bg-glass-bg/40 hover:border-observatory-accent/40'
      )}
    >
      {/* Selected Badge */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-observatory-accent rounded-full flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-space-deep" />
        </motion.div>
      )}

      {/* Icon */}
      <Icon
        className={cn(
          'w-8 h-8 mb-2 transition-colors',
          selected ? 'text-observatory-accent' : 'text-text-secondary'
        )}
      />

      {/* Name */}
      <span
        className={cn(
          'text-xs font-medium text-center transition-colors',
          selected ? 'text-observatory-accent' : 'text-text-primary'
        )}
      >
        {name}
      </span>
    </motion.button>
  );
}
