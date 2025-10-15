'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from 'next-intl'

interface Category {
  id: string
  slug: string
  name: string
  icon: string
  level: number
  parent_category_id: string | null
}

interface SidebarCategoryTreeProps {
  categories: Category[]
}

export function SidebarCategoryTree({ categories }: SidebarCategoryTreeProps) {
  const locale = useLocale()
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  // Separate main and sub categories
  const mainCategories = categories.filter(c => c.level === 0)
  const subCategories = categories.filter(c => c.level === 1)

  // Group subcategories by parent
  const subCategoriesByParent = subCategories.reduce((acc, cat) => {
    const parentId = cat.parent_category_id || 'none'
    if (!acc[parentId]) acc[parentId] = []
    acc[parentId].push(cat)
    return acc
  }, {} as Record<string, Category[]>)

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-categories-open')
    if (saved) {
      try {
        setOpenCategories(new Set(JSON.parse(saved)))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-categories-open', JSON.stringify(Array.from(openCategories)))
  }, [openCategories])

  const toggleCategory = (categoryId: string) => {
    const newOpen = new Set(openCategories)
    if (newOpen.has(categoryId)) {
      newOpen.delete(categoryId)
    } else {
      newOpen.add(categoryId)
    }
    setOpenCategories(newOpen)
  }

  return (
    <div className="space-y-1">
      {mainCategories.map((mainCat) => {
        const subs = subCategoriesByParent[mainCat.id] || []
        const isOpen = openCategories.has(mainCat.id)
        const hasSubcategories = subs.length > 0

        return (
          <div key={mainCat.id}>
            {/* Main Category */}
            <div className="flex items-center gap-1">
              {hasSubcategories ? (
                <button
                  onClick={() => toggleCategory(mainCat.id)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}
              <Link href={`/${locale}/admin/categories/${mainCat.slug}`} className="flex-1">
                <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm">
                  <span className="mr-2">{mainCat.icon}</span>
                  <span className="truncate">{mainCat.name}</span>
                </Button>
              </Link>
            </div>

            {/* Subcategories */}
            {hasSubcategories && isOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                {subs.map((subCat) => (
                  <Link key={subCat.id} href={`/${locale}/admin/categories/${subCat.slug}`}>
                    <Button variant="ghost" className="w-full justify-start h-7 px-2 text-xs">
                      <span className="mr-2 text-sm">{subCat.icon}</span>
                      <span className="truncate">{subCat.name}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
