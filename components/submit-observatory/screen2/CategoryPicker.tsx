'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Edit2,
  Search,
  X,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { CategoryGrid } from './CategoryGrid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/category-icons';

interface CategoryPickerProps {
  currentCategory: string;
  onSelect: (category: string) => void;
  getCategoryTranslation: (category: string) => string;
  variant?: 'default' | 'inline'; // inline = no label, simpler trigger
}

export function CategoryPicker({
  currentCategory,
  onSelect,
  getCategoryTranslation,
  variant = 'default',
}: CategoryPickerProps) {
  const t = useTranslations('submit.screen2.aiResults');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (category: string) => {
    onSelect(category);
    setOpen(false);
    setSearchQuery(''); // Reset search on close
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery(''); // Reset search when closing
    }
  };

  // Get icon for current category from our mapping
  const CategoryIcon = getCategoryIcon(currentCategory);

  // Inline variant (for AIHeroHeader)
  const inlineTrigger = (
    <button
      className="group flex items-center gap-1.5 text-sm font-bold text-observatory-accent uppercase tracking-wide hover:text-observatory-accent/80 transition-colors"
      aria-label="Kategorie bearbeiten"
    >
      <span>{currentCategory ? getCategoryTranslation(currentCategory) : 'Unknown'}</span>
      <Edit2 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  // Default variant (full badge with label)
  const defaultTrigger = (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-medium text-text-tertiary uppercase">
          Kategorie
        </label>
        <button
          className="text-text-tertiary hover:text-text-secondary transition-colors"
          aria-label="Kategorie bearbeiten"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>

      <div
        className={cn(
          'flex items-center justify-center gap-2 px-3 py-2',
          'bg-observatory-accent/10 border border-observatory-accent/20',
          'rounded-lg text-xs text-observatory-accent',
          'cursor-pointer hover:border-observatory-accent/40 transition-all',
          'hover:bg-observatory-accent/15 active:scale-[0.98]'
        )}
      >
        <CategoryIcon className="w-4 h-4" />
        <span>{currentCategory ? getCategoryTranslation(currentCategory) : 'Unknown'}</span>
      </div>
    </div>
  );

  const trigger = variant === 'inline' ? inlineTrigger : defaultTrigger;

  // Search Input Component (shared)
  const searchInput = (
    <div className="relative px-3 pb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suchen..."
          className="w-full pl-9 pr-8 py-2 bg-glass-bg border border-glass-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-observatory-accent/50 focus:border-observatory-accent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-glass-border rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-text-tertiary" />
          </button>
        )}
      </div>
    </div>
  );

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">Kategorie wählen</DrawerTitle>
          </DrawerHeader>
          {searchInput}
          <div className="max-h-[60vh] overflow-y-auto">
            <CategoryGrid
              currentCategory={currentCategory}
              onSelect={handleSelect}
              columns={2}
              searchQuery={searchQuery}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Popover
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-0 bg-space-mid/95 backdrop-blur-md border-glass-border"
        align="start"
      >
        <div className="p-3 border-b border-glass-border">
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Kategorie wählen
          </h3>
        </div>
        {searchInput}
        <div className="max-h-[400px] overflow-y-auto">
          <CategoryGrid
            currentCategory={currentCategory}
            onSelect={handleSelect}
            columns={3}
            searchQuery={searchQuery}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
