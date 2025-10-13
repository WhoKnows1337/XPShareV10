'use client';

import { useTranslations } from 'next-intl';
import {
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
import { CategoryCard } from './CategoryCard';

interface CategoryGridProps {
  currentCategory: string;
  onSelect: (category: string) => void;
  columns?: 2 | 3;
}

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

export function CategoryGrid({ currentCategory, onSelect, columns = 3 }: CategoryGridProps) {
  const tCategories = useTranslations('categories');

  const availableCategories = [
    'paranormal',
    'ufo_sighting',
    'synchronicity',
    'spiritual_experience',
    'near_death_experience',
    'psychic_experience',
    'cryptid_encounter',
    'other',
  ];

  return (
    <div
      className={`grid gap-3 p-4 ${
        columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {availableCategories.map((category) => (
        <CategoryCard
          key={category}
          icon={categoryIcons[category]}
          name={tCategories(category)}
          value={category}
          selected={currentCategory === category}
          onClick={() => onSelect(category)}
        />
      ))}
    </div>
  );
}
