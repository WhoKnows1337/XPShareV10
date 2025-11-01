import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FolderOpen, Plus, MessageSquare, Tag, TrendingUp, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { CategoriesTreeView } from './categories-tree-view'

interface QuestionCategoryRow {
  id: string
  slug: string
  name: string
  icon: string | null
  emoji: string | null
  color: string | null
  description: string | null
  level: number | null
  is_active: boolean | null
  parent_category_id: string | null
  sort_order: number
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
}

interface CategoryWithStats {
  id: string
  slug: string
  name: string
  icon: string | null
  description: string | null
  level: number | null
  is_active: boolean | null
  parent_category_id: string | null
  questionCount: number
  attributeCount: number
  completionPercentage: number
}

export default async function CategoriesOverviewPage() {
  const supabase = await createClient()

  // Fetch all categories with type assertion
  const { data: categoriesData } = await supabase
    .from('question_categories')
    .select('*')
    .order('level')
    .order('sort_order', { ascending: true })

  if (!categoriesData) {
    return <div>Error loading categories</div>
  }

  const categories: QuestionCategoryRow[] = categoriesData

  // Get question counts for each category
  const categoriesWithStats: CategoryWithStats[] = await Promise.all(
    categories.map(async (category) => {
      const { count: questionCount } = await supabase
        .from('dynamic_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true)

      // Get attribute count
      const { count: attributeCount } = await supabase
        .from('attribute_schema')
        .select('*', { count: 'exact', head: true })
        .eq('category_slug', category.slug)

      // Calculate completion percentage
      // Criteria: Has questions (50%) + Has attributes (50%)
      let completion = 0
      if (questionCount && questionCount > 0) completion += 50
      if (attributeCount && attributeCount > 0) completion += 50

      return {
        ...category,
        questionCount: questionCount || 0,
        attributeCount: attributeCount || 0,
        completionPercentage: completion,
      }
    })
  )

  // Separate main and sub categories
  const mainCategories = categoriesWithStats.filter(c => c.level === 0)
  const subCategories = categoriesWithStats.filter(c => c.level === 1)

  // Group subcategories by parent
  const subCategoriesByParent = subCategories.reduce((acc, cat) => {
    const parentId = cat.parent_category_id || 'none'
    if (!acc[parentId]) acc[parentId] = []
    acc[parentId].push(cat)
    return acc
  }, {} as Record<string, CategoryWithStats[]>)

  // Calculate overall stats
  const totalCategories = categoriesWithStats.length
  const categoriesWithQuestions = categoriesWithStats.filter(c => c.questionCount > 0).length
  const categoriesWithAttributes = categoriesWithStats.filter(c => c.attributeCount > 0).length
  const fullyConfigured = categoriesWithStats.filter(c => c.completionPercentage === 100).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Categories Management</h2>
        <p className="text-muted-foreground">
          Manage categories, their questions, and attributes. Click into any category to configure it.
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {mainCategories.length} main, {subCategories.length} sub
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesWithQuestions}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((categoriesWithQuestions / totalCategories) * 100)}% configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesWithAttributes}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((categoriesWithAttributes / totalCategories) * 100)}% configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fully Configured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{fullyConfigured}</div>
            <p className="text-xs text-muted-foreground">
              Questions + Attributes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tree View */}
      <CategoriesTreeView
        mainCategories={mainCategories}
        subCategoriesByParent={subCategoriesByParent}
      />
    </div>
  )
}
