import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FolderOpen, Plus } from 'lucide-react'

export default async function QuestionsPage() {
  const supabase = await createClient()

  // Fetch all categories with question counts
  const { data: categoriesRaw } = await supabase
    .from('question_categories')
    .select('*')
    .order('sort_order', { ascending: true })

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

  const categories: QuestionCategoryRow[] | null = categoriesRaw

  // Get question counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('dynamic_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)

      return {
        ...category,
        questionCount: count || 0,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Questions Management</h2>
          <p className="text-muted-foreground">
            Manage dynamic questions by category
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesWithCounts.map((category) => (
          <Link key={category.id} href={`/admin/categories/${category.slug}`}>
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{category.icon}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{category.slug}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={category.is_active ? 'default' : 'secondary'}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FolderOpen className="h-4 w-4" />
                    <span>{category.questionCount} questions</span>
                  </div>
                </div>
                {category.description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {categoriesWithCounts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
            <p className="text-sm text-muted-foreground">
              Categories need to be seeded in the database
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
