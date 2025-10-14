import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FolderOpen, Plus, MessageSquare, Tag, TrendingUp, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

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

export default async function CategoriesOverviewPage() {
  const supabase = await createClient()

  // Fetch all categories
  const { data: categories } = await supabase
    .from('question_categories')
    .select('*')
    .order('level')
    .order('sort_order', { ascending: true })

  if (!categories) {
    return <div>Error loading categories</div>
  }

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

  function getCompletionIcon(percentage: number) {
    if (percentage === 100) return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (percentage >= 50) return <AlertCircle className="w-4 h-4 text-yellow-500" />
    return <Circle className="w-4 h-4 text-gray-300" />
  }

  function getCompletionBadge(percentage: number) {
    if (percentage === 100) return <Badge variant="default" className="bg-green-500">Complete</Badge>
    if (percentage >= 50) return <Badge variant="secondary" className="bg-yellow-500 text-yellow-950">Partial</Badge>
    return <Badge variant="outline">Empty</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Categories Management</h2>
          <p className="text-muted-foreground">
            Manage question categories, attributes, and their configuration
          </p>
        </div>
        <Link href="/admin/attributes">
          <Button variant="outline">
            <Tag className="mr-2 h-4 w-4" />
            Manage Attributes
          </Button>
        </Link>
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

      {/* Main Categories with Subcategories */}
      <div className="space-y-6">
        {mainCategories.map((mainCat) => {
          const subs = subCategoriesByParent[mainCat.id] || []
          const mainCatQuestions = mainCat.questionCount + subs.reduce((sum, sub) => sum + sub.questionCount, 0)
          const mainCatAttributes = mainCat.attributeCount + subs.reduce((sum, sub) => sum + sub.attributeCount, 0)

          return (
            <Card key={mainCat.id} className="overflow-hidden">
              {/* Main Category Header */}
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{mainCat.icon}</span>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {mainCat.name}
                        {getCompletionIcon(mainCat.completionPercentage)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{mainCat.slug}</p>
                      {mainCat.description && (
                        <p className="text-sm text-muted-foreground mt-1">{mainCat.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">Total Questions</div>
                      <div className="text-2xl font-bold">{mainCatQuestions}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">Total Attributes</div>
                      <div className="text-2xl font-bold">{mainCatAttributes}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Subcategories Grid */}
              {subs.length > 0 && (
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subs.map((subCat) => (
                      <Link key={subCat.id} href={`/admin/categories/${subCat.slug}`}>
                        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] h-full">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{subCat.icon}</span>
                                <div>
                                  <CardTitle className="text-base">{subCat.name}</CardTitle>
                                  <p className="text-xs text-muted-foreground">{subCat.slug}</p>
                                </div>
                              </div>
                              {getCompletionIcon(subCat.completionPercentage)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MessageSquare className="w-3 h-3" />
                                <span>{subCat.questionCount} questions</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Tag className="w-3 h-3" />
                                <span>{subCat.attributeCount} attrs</span>
                              </div>
                            </div>

                            {getCompletionBadge(subCat.completionPercentage)}

                            {subCat.completionPercentage < 100 && (
                              <div className="pt-2 mt-2 border-t">
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  {subCat.questionCount === 0 && '⚠️ No questions'}
                                  {subCat.questionCount > 0 && subCat.attributeCount === 0 && '⚠️ No attributes'}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              )}

              {/* No subcategories */}
              {subs.length === 0 && (
                <CardContent>
                  <Link href={`/admin/categories/${mainCat.slug}`}>
                    <Button variant="outline" className="w-full">
                      Configure Category
                    </Button>
                  </Link>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Orphan subcategories (shouldn't exist, but just in case) */}
      {subCategoriesByParent['none'] && (
        <Card>
          <CardHeader>
            <CardTitle>Uncategorized Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subCategoriesByParent['none'].map((subCat) => (
                <Link key={subCat.id} href={`/admin/categories/${subCat.slug}`}>
                  <Card className="cursor-pointer hover:bg-accent">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>{subCat.icon}</span>
                        {subCat.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {subCat.questionCount} questions, {subCat.attributeCount} attributes
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
