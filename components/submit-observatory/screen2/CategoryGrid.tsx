'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import { type Category, enhanceCategories, sortCategoriesForDisplay } from '@/lib/category-utils';

interface CategoryGridProps {
  currentCategory: string;
  onSelect: (category: string) => void;
  columns?: 2 | 3;
  searchQuery?: string;
}

export function CategoryGrid({ currentCategory, onSelect, columns = 3, searchQuery = '' }: CategoryGridProps) {
  const tCategories = useTranslations('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Failed to load categories');
        }

        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Kategorien konnten nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter categories by search query
  const filteredCategories = categories.filter((category) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    );
  });

  // Sort for display
  const sortedCategories = sortCategoriesForDisplay(filteredCategories);

  // Enhance with UI properties
  const enhancedCategories = enhanceCategories(sortedCategories);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-observatory-accent" />
        <span className="ml-2 text-sm text-text-secondary">Lade Kategorien...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mb-2" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // No results
  if (filteredCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-text-tertiary">
          {searchQuery ? 'Keine Kategorien gefunden' : 'Keine Kategorien verfügbar'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 p-4 ${
        columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {enhancedCategories.map((category) => (
        <CategoryCard
          key={category.id}
          icon={category.iconComponent}
          name={category.name}
          value={category.slug}
          selected={currentCategory.toLowerCase() === category.slug.toLowerCase()}
          onClick={() => onSelect(category.slug)}
        />
      ))}
    </div>
  );
}
