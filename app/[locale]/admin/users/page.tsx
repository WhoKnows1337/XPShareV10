import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { UserActions } from '@/components/admin/user-actions'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('user_profiles')
    .select(`
      *,
      experiences:experiences(count),
      comments:comments(count),
      user_badges:user_badges(count)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">User Management</h2>
        <p className="text-muted-foreground">
          View and manage user accounts
        </p>
      </div>

      {!users || users.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user: any) => (
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
                        {user.is_admin && (
                          <Badge variant="destructive">Admin</Badge>
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
                        <span>{user.xp || 0} XP</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <UserActions userId={user.id} isAdmin={user.is_admin || false} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
