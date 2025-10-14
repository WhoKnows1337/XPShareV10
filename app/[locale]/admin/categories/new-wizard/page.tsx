import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { CategoryCreationWizard } from './wizard-client'

export const metadata = {
  title: 'Create Category - Admin',
  description: 'AI-powered category creation wizard',
}

export default async function CategoryCreationWizardPage() {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin/categories/new-wizard')
  }

  const userIsAdmin = await isAdmin(user.id)
  if (!userIsAdmin) {
    redirect('/')
  }

  return (
    <div className="container mx-auto py-8">
      <CategoryCreationWizard />
    </div>
  )
}
