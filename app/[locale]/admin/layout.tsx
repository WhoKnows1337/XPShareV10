import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, FileQuestion, Flag, Users, BarChart } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

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
              <Link href="/admin/questions">
                <Button variant="ghost" className="w-full justify-start">
                  <FileQuestion className="mr-2 h-4 w-4" />
                  Questions
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
                  Users
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
