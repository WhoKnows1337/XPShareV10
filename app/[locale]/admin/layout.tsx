import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, FileQuestion, Flag, Users, BarChart, TrendingUp, FileText, History, Globe, Sparkles, FolderTree, Folders, Plus, Edit3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SidebarCategoryTree } from './sidebar-category-tree'
import { useTranslations } from 'next-intl'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  const t = await getTranslations('admin')
  const locale = await getLocale()

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
              <h1 className="text-2xl font-bold">{t('title')}</h1>
            </div>
            <Link href={`/${locale}`}>
              <Button variant="outline">{t('backToSite')}</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <nav className="space-y-2">
              <Link href={`/${locale}/admin`}>
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  {t('sidebar.dashboard')}
                </Button>
              </Link>

              {/* Categories Section */}
              <div className="px-2 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('sidebar.categories')}
                </p>
              </div>
              <Link href={`/${locale}/admin/categories`}>
                <Button variant="ghost" className="w-full justify-start">
                  <Folders className="mr-2 h-4 w-4" />
                  {t('sidebar.overview')}
                </Button>
              </Link>

              {/* Category Tree */}
              {categories && categories.length > 0 && (
                <div className="mt-2">
                  <SidebarCategoryTree categories={categories as any} />
                </div>
              )}

              <div className="mt-2 space-y-1">
                <Link href={`/${locale}/admin/global-config`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Globe className="mr-2 h-4 w-4" />
                    {t('sidebar.globalConfig')}
                  </Button>
                </Link>
                <Link href={`/${locale}/admin/categories/new-wizard`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('sidebar.createCategory')}
                  </Button>
                </Link>
              </div>

              {/* Tools & Templates Section */}
              <div className="px-2 py-2 mt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('sidebar.toolsAnalytics')}
                </p>
              </div>
              <Link href={`/${locale}/admin/templates`}>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  {t('sidebar.templates')}
                </Button>
              </Link>
              <Link href={`/${locale}/admin/custom-values`}>
                <Button variant="ghost" className="w-full justify-start">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Custom Values
                </Button>
              </Link>
              <Link href={`/${locale}/admin/analytics`}>
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t('sidebar.analytics')}
                </Button>
              </Link>
              <Link href={`/${locale}/admin/history`}>
                <Button variant="ghost" className="w-full justify-start">
                  <History className="mr-2 h-4 w-4" />
                  {t('sidebar.history')}
                </Button>
              </Link>
              <Link href={`/${locale}/admin/moderation`}>
                <Button variant="ghost" className="w-full justify-start">
                  <Flag className="mr-2 h-4 w-4" />
                  {t('sidebar.moderation')}
                </Button>
              </Link>
              <Link href={`/${locale}/admin/users`}>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {t('sidebar.usersRoles')}
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
