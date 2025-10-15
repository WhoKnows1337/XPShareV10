'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MessageSquare, Tag, Settings, CheckCircle2, AlertCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react'

interface CategoryWithStats {
  id: string
  slug: string
  name: string
  icon: string
  description: string | null
  level: number
  is_active: boolean
  parent_category_id: string | null
  questionCount: number
  attributeCount: number
  completionPercentage: number
}

interface CategoriesTreeViewProps {
  mainCategories: CategoryWithStats[]
  subCategoriesByParent: Record<string, CategoryWithStats[]>
}

export function CategoriesTreeView({
  mainCategories,
  subCategoriesByParent,
}: CategoriesTreeViewProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([])

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-categories-open')
    if (saved) {
      try {
        setOpenCategories(JSON.parse(saved))
      } catch (e) {
        // Ignore parse errors
      }
    } else {
      // Default: all categories open
      setOpenCategories(mainCategories.map(c => c.id))
    }
  }, [mainCategories])

  // Save state to localStorage
  useEffect(() => {
    if (openCategories.length > 0) {
      localStorage.setItem('admin-categories-open', JSON.stringify(openCategories))
    }
  }, [openCategories])

  const handleExpandAll = () => {
    setOpenCategories(mainCategories.map(c => c.id))
  }

  const handleCollapseAll = () => {
    setOpenCategories([])
  }

  const getCompletionIcon = (percentage: number) => {
    if (percentage === 100) return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (percentage >= 50) return <AlertCircle className="w-4 h-4 text-yellow-500" />
    return <Circle className="w-4 h-4 text-gray-300" />
  }

  const getCompletionBadge = (percentage: number) => {
    if (percentage === 100) return <Badge variant="default" className="bg-green-500 text-white">Complete</Badge>
    if (percentage >= 50) return <Badge variant="secondary" className="bg-yellow-500 text-yellow-950">Partial</Badge>
    return <Badge variant="outline" className="text-gray-500">Empty</Badge>
  }

  return (
    <Card className="p-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h3 className="text-lg font-semibold">Category Tree</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree View using Accordion */}
      <Accordion
        type="multiple"
        value={openCategories}
        onValueChange={setOpenCategories}
        className="space-y-2"
      >
        {mainCategories.map((mainCat) => {
          const subs = subCategoriesByParent[mainCat.id] || []
          const totalQuestions = mainCat.questionCount + subs.reduce((sum, sub) => sum + sub.questionCount, 0)
          const totalAttributes = mainCat.attributeCount + subs.reduce((sum, sub) => sum + sub.attributeCount, 0)

          return (
            <AccordionItem
              key={mainCat.id}
              value={mainCat.id}
              className="border rounded-lg overflow-hidden bg-muted/30"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between w-full mr-4">
                  {/* Left: Icon + Name + Icon */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mainCat.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{mainCat.name}</span>
                        {getCompletionIcon(mainCat.completionPercentage)}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{mainCat.slug}</p>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{totalQuestions}</span>
                      <span className="text-xs">Q</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Tag className="w-4 h-4" />
                      <span className="font-medium">{totalAttributes}</span>
                      <span className="text-xs">A</span>
                    </div>
                    {getCompletionBadge(mainCat.completionPercentage)}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                {subs.length > 0 ? (
                  <div className="space-y-2 pl-8 pt-2">
                    {subs.map((subCat) => (
                      <div
                        key={subCat.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border hover:bg-accent/50 transition-colors group"
                      >
                        {/* Left: Icon + Name + Status */}
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{subCat.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{subCat.name}</span>
                              {getCompletionIcon(subCat.completionPercentage)}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{subCat.slug}</p>
                          </div>
                        </div>

                        {/* Middle: Stats */}
                        <div className="flex items-center gap-4 mr-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            <span>{subCat.questionCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Tag className="w-3 h-3" />
                            <span>{subCat.attributeCount}</span>
                          </div>
                          {getCompletionBadge(subCat.completionPercentage)}
                        </div>

                        {/* Right: Action Button */}
                        <Link href={`/admin/categories/${subCat.slug}`}>
                          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-8 pt-2">
                    <div className="p-4 rounded-lg bg-muted/50 border-dashed border-2 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        No subcategories yet
                      </p>
                      <Link href={`/admin/categories/${mainCat.slug}`}>
                        <Button variant="outline" size="sm">
                          <Settings className="w-3 h-3 mr-1" />
                          Configure Category
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {mainCategories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No categories yet</p>
          <Link href="/admin/categories/new-wizard">
            <Button>Create First Category</Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
