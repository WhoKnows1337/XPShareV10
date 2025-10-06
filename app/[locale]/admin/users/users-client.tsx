'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Shield, UserCog, Ban, CheckCircle, History } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

type AdminRole = 'super_admin' | 'content_manager' | 'analyst' | null

interface User {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  level: number
  total_xp: number
  created_at: string
  email: string | null
  admin_role: Array<{ role: AdminRole }> | null
  experiences: Array<{ count: number }>
  comments: Array<{ count: number }>
  user_badges: Array<{ count: number }>
}

interface UsersClientProps {
  users: User[]
}

const roleColors = {
  super_admin: 'bg-red-500',
  content_manager: 'bg-yellow-500',
  analyst: 'bg-green-500',
}

const roleLabels = {
  super_admin: '🔴 Super Admin',
  content_manager: '🟡 Content Manager',
  analyst: '🟢 Analyst',
}

export function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [filter, setFilter] = useState<'all' | 'admins' | 'regular'>('all')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<AdminRole>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [activityLogUser, setActivityLogUser] = useState<User | null>(null)
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false)
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Filter users
  const filteredUsers = users.filter((user) => {
    const role = user.admin_role?.[0]?.role || null
    const matchesFilter =
      filter === 'all' ||
      (filter === 'admins' && role !== null) ||
      (filter === 'regular' && role === null)

    const matchesSearch =
      !search ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Count by role
  const roleCounts = {
    all: users.length,
    super_admin: users.filter((u) => u.admin_role?.[0]?.role === 'super_admin').length,
    content_manager: users.filter((u) => u.admin_role?.[0]?.role === 'content_manager').length,
    analyst: users.filter((u) => u.admin_role?.[0]?.role === 'analyst').length,
    regular: users.filter((u) => !u.admin_role || u.admin_role.length === 0).length,
  }

  const handleChangeRole = async () => {
    if (!selectedUser) return

    try {
      const currentRole = selectedUser.admin_role?.[0]?.role

      if (newRole === null && currentRole) {
        // Remove admin role
        const res = await fetch(`/api/admin/permissions/users/${selectedUser.id}`, {
          method: 'DELETE',
        })

        if (!res.ok) throw new Error('Failed to remove admin role')

        toast({
          title: 'Success',
          description: 'Admin role removed',
        })
      } else if (newRole !== null) {
        // Add or update admin role
        if (currentRole) {
          // Update existing role
          const res = await fetch(`/api/admin/permissions/users/${selectedUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          })

          if (!res.ok) throw new Error('Failed to update role')
        } else {
          // Add new admin role using email
          const res = await fetch('/api/admin/permissions/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: selectedUser.email,
              role: newRole
            }),
          })

          if (!res.ok) throw new Error('Failed to add admin role')
        }

        toast({
          title: 'Success',
          description: `Role changed to ${roleLabels[newRole]}`,
        })
      }

      setIsRoleDialogOpen(false)
      setSelectedUser(null)
      router.refresh()
    } catch (error) {
      console.error('Role change error:', error)
      toast({
        title: 'Error',
        description: 'Failed to change role',
        variant: 'destructive',
      })
    }
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.admin_role?.[0]?.role || null)
    setIsRoleDialogOpen(true)
  }

  const openActivityLog = async (user: User) => {
    setActivityLogUser(user)
    setIsActivityLogOpen(true)
    setLoadingActivity(true)

    try {
      // Load activity from question_change_history for this user
      const res = await fetch(`/api/admin/history?user_id=${user.id}`)
      if (res.ok) {
        const { data } = await res.json()
        setActivityLog(data || [])
      }
    } catch (error) {
      console.error('Load activity error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load activity log',
        variant: 'destructive',
      })
    } finally {
      setLoadingActivity(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">User Management</h2>
        <p className="text-muted-foreground">
          Manage all platform users and admin roles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{roleCounts.all}</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{roleCounts.super_admin}</div>
            <p className="text-xs text-muted-foreground">🔴 Super Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{roleCounts.content_manager}</div>
            <p className="text-xs text-muted-foreground">🟡 Content Managers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{roleCounts.analyst}</div>
            <p className="text-xs text-muted-foreground">🟢 Analysts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{roleCounts.regular}</div>
            <p className="text-xs text-muted-foreground">Regular Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(val: any) => setFilter(val)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users ({roleCounts.all})</SelectItem>
            <SelectItem value="admins">
              Only Admins ({roleCounts.super_admin + roleCounts.content_manager + roleCounts.analyst})
            </SelectItem>
            <SelectItem value="regular">Regular Users ({roleCounts.regular})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const role = user.admin_role?.[0]?.role || null

            return (
              <Card key={user.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.display_name || user.username}</h3>
                          {role && (
                            <Badge className={roleColors[role]}>
                              {roleLabels[role]}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{user.experiences?.[0]?.count || 0} experiences</span>
                          <span>•</span>
                          <span>{user.comments?.[0]?.count || 0} comments</span>
                          <span>•</span>
                          <span>{user.user_badges?.[0]?.count || 0} badges</span>
                          <span>•</span>
                          <span>Level {user.level || 1}</span>
                          <span>•</span>
                          <span>{user.total_xp || 0} XP</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {role && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActivityLog(user)}
                        >
                          <History className="mr-2 h-4 w-4" />
                          Activity Log
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRoleDialog(user)}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        {role ? 'Change Role' : 'Make Admin'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <p className="text-sm font-medium mt-1">
                {selectedUser?.display_name || selectedUser?.username}
              </p>
              <p className="text-xs text-muted-foreground">@{selectedUser?.username}</p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newRole || 'regular'}
                onValueChange={(val) => setNewRole(val === 'regular' ? null : (val as AdminRole))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular User (No Admin Access)</SelectItem>
                  <SelectItem value="super_admin">🔴 Super Admin (Full Access)</SelectItem>
                  <SelectItem value="content_manager">🟡 Content Manager (Edit Content)</SelectItem>
                  <SelectItem value="analyst">🟢 Analyst (View Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleChangeRole} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Log</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {activityLogUser?.display_name || activityLogUser?.username} (@{activityLogUser?.username})
            </p>
          </DialogHeader>

          {loadingActivity ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading activity...</p>
            </div>
          ) : activityLog.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
              <p className="text-sm text-muted-foreground">
                This user hasn't made any changes to questions or categories
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityLog.map((activity) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {activity.entity_type === 'category' ? '📂' : '❓'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          activity.change_type === 'created' ? 'default' :
                          activity.change_type === 'updated' ? 'secondary' :
                          'destructive'
                        }>
                          {activity.change_type}
                        </Badge>
                        <Badge variant="outline">{activity.entity_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.changed_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{activity.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
