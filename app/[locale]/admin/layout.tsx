import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, FileQuestion, Flag, Users, BarChart, TrendingUp, FileText, History, Globe, Sparkles, FolderTree, Folders, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SidebarCategoryTree } from './sidebar-category-tree'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  // Fetch categories for sidebar tree
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('question_categories')
    .select('id, slug, name, icon, level, parent_category_id')
    .order('level')
    .order('sort_order', { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <nav className="space-y-2">
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              {/* Categories Section */}
              <div className="px-2 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Categories
                </p>
              </div>
              <Link href="/admin/categories">
                <Button variant="ghost" className="w-full justify-start">
                  <Folders className="mr-2 h-4 w-4" />
                  Overview
                </Button>
              </Link>

              {/* Category Tree */}
              {categories && categories.length > 0 && (
                <div className="mt-2">
                  <SidebarCategoryTree categories={categories} />
                </div>
              )}

              <div className="mt-2 space-y-1">
                <Link href="/admin/global-config">
                  <Button variant="ghost" className="w-full justify-start">
                    <Globe className="mr-2 h-4 w-4" />
                    Global Configuration
                  </Button>
                </Link>
                <Link href="/admin/categories/new-wizard">
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Category
                  </Button>
                </Link>
              </div>

              {/* Tools & Templates Section */}
              <div className="px-2 py-2 mt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tools & Analytics
                </p>
              </div>
              <Link href="/admin/templates">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Templates
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/admin/history">
                <Button variant="ghost" className="w-full justify-start">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </Link>
              <Link href="/admin/moderation">
                <Button variant="ghost" className="w-full justify-start">
                  <Flag className="mr-2 h-4 w-4" />
                  Moderation
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Users & Roles
                </Button>
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-9">{children}</div>
        </div>
      </div>
    </div>
  )
}
