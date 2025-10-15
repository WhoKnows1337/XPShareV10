import { type LucideIcon } from 'lucide-react';
import { getCategoryIcon, getCategoryColor, getCategoryBgClass } from './category-icons';

/**
 * Category from database
 */
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  emoji?: string | null;
  color?: string | null;
  is_active: boolean;
  level: number; // 0 = main category, 1 = subcategory
  parent_category_id?: string | null;
  sort_order: number;
}

/**
 * Category with computed properties for UI
 */
export interface CategoryWithIcon extends Category {
  iconComponent: LucideIcon;
  displayColor: string;
  bgClass: string;
  isMainCategory: boolean;
  isSubcategory: boolean;
}

/**
 * Enhance a category with UI properties
 */
export function enhanceCategory(category: Category): CategoryWithIcon {
  return {
    ...category,
    iconComponent: getCategoryIcon(category.slug),
    displayColor: getCategoryColor(category.slug, category.color),
    bgClass: getCategoryBgClass(category.slug),
    isMainCategory: category.level === 0,
    isSubcategory: category.level === 1,
  };
}

/**
 * Enhance multiple categories
 */
export function enhanceCategories(categories: Category[]): CategoryWithIcon[] {
  return categories.map(enhanceCategory);
}

/**
 * Group categories by parent (for hierarchical display)
 */
export function groupCategoriesByParent(categories: Category[]): {
  mainCategories: Category[];
  subcategoriesByParent: Record<string, Category[]>;
} {
  const mainCategories: Category[] = [];
  const subcategoriesByParent: Record<string, Category[]> = {};

  for (const category of categories) {
    if (category.level === 0) {
      mainCategories.push(category);
      subcategoriesByParent[category.id] = [];
    }
  }

  for (const category of categories) {
    if (category.level === 1 && category.parent_category_id) {
      if (!subcategoriesByParent[category.parent_category_id]) {
        subcategoriesByParent[category.parent_category_id] = [];
      }
      subcategoriesByParent[category.parent_category_id].push(category);
    }
  }

  return { mainCategories, subcategoriesByParent };
}

/**
 * Filter categories by search query
 */
export function filterCategories(
  categories: Category[],
  searchQuery: string
): Category[] {
  if (!searchQuery.trim()) {
    return categories;
  }

  const query = searchQuery.toLowerCase();

  return categories.filter((category) => {
    // Search in name
    if (category.name.toLowerCase().includes(query)) {
      return true;
    }

    // Search in slug
    if (category.slug.toLowerCase().includes(query)) {
      return true;
    }

    // Search in description
    if (category.description && category.description.toLowerCase().includes(query)) {
      return true;
    }

    return false;
  });
}

/**
 * Find category by slug
 */
export function findCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  return categories.find((cat) => cat.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Get parent category for a subcategory
 */
export function getParentCategory(
  categories: Category[],
  categoryId: string
): Category | undefined {
  const category = categories.find((cat) => cat.id === categoryId);
  if (!category || !category.parent_category_id) {
    return undefined;
  }

  return categories.find((cat) => cat.id === category.parent_category_id);
}

/**
 * Get all subcategories for a parent category
 */
export function getSubcategories(
  categories: Category[],
  parentId: string
): Category[] {
  return categories.filter(
    (cat) => cat.level === 1 && cat.parent_category_id === parentId
  );
}

/**
 * Sort categories for display (main categories first, then by sort_order)
 */
export function sortCategoriesForDisplay(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    // First by level (main categories first)
    if (a.level !== b.level) {
      return a.level - b.level;
    }

    // Then by sort_order
    return a.sort_order - b.sort_order;
  });
}
