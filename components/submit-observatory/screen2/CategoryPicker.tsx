'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Edit2,
  Ghost,
  Telescope,
  Sparkles,
  Heart,
  Zap,
  Brain,
  Footprints,
  HelpCircle,
  LucideIcon,
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

// Icon mapping for each category
const categoryIcons: Record<string, LucideIcon> = {
  paranormal: Ghost,
  ufo_sighting: Telescope,
  synchronicity: Sparkles,
  spiritual_experience: Heart,
  near_death_experience: Zap,
  psychic_experience: Brain,
  cryptid_encounter: Footprints,
  other: HelpCircle,
};

interface CategoryPickerProps {
  currentCategory: string;
  onSelect: (category: string) => void;
  getCategoryTranslation: (category: string) => string;
}

export function CategoryPicker({
  currentCategory,
  onSelect,
  getCategoryTranslation,
}: CategoryPickerProps) {
  const t = useTranslations('submit.screen2.aiResults');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = useState(false);

  const handleSelect = (category: string) => {
    onSelect(category);
    setOpen(false);
  };

  // Get icon for current category
  const CategoryIcon = categoryIcons[currentCategory.toLowerCase()] || HelpCircle;

  // Badge Trigger Component (shared between Popover and Drawer)
  const trigger = (
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

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">Kategorie wählen</DrawerTitle>
          </DrawerHeader>
          <CategoryGrid
            currentCategory={currentCategory}
            onSelect={handleSelect}
            columns={2}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0 bg-space-mid/95 backdrop-blur-md border-glass-border"
        align="start"
      >
        <div className="p-3 border-b border-glass-border">
          <h3 className="text-sm font-semibold text-text-primary">
            Kategorie wählen
          </h3>
        </div>
        <CategoryGrid
          currentCategory={currentCategory}
          onSelect={handleSelect}
          columns={3}
        />
      </PopoverContent>
    </Popover>
  );
}
