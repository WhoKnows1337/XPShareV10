'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserPlus, Mail, User } from 'lucide-react'
import { toast } from 'sonner'

interface InviteWitnessDialogProps {
  experienceId: string
  experienceTitle: string
}

export function InviteWitnessDialog({ experienceId, experienceTitle }: InviteWitnessDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [inviteMethod, setInviteMethod] = useState<'email' | 'username'>('email')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  const handleInvite = () => {
    if (inviteMethod === 'email' && !email) {
      toast.error('Please enter an email address')
      return
    }
    if (inviteMethod === 'username' && !username) {
      toast.error('Please enter a username')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/experiences/${experienceId}/invite-witness`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: inviteMethod,
            email: inviteMethod === 'email' ? email : undefined,
            username: inviteMethod === 'username' ? username : undefined,
            message,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send invitation')
        }

        toast.success(data.message || 'Invitation sent successfully!')
        setOpen(false)
        setEmail('')
        setUsername('')
        setMessage('')
      } catch (error) {
        console.error('Invite error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Witness
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Witness</DialogTitle>
          <DialogDescription>
            Invite someone who was present during your experience to share their perspective.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invite Method Toggle */}
          <div className="flex gap-2">
            <Button
              variant={inviteMethod === 'email' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setInviteMethod('email')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant={inviteMethod === 'username' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setInviteMethod('username')}
            >
              <User className="w-4 h-4 mr-2" />
              Username
            </Button>
          </div>

          {/* Email Input */}
          {inviteMethod === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="witness@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                They'll receive an email invitation to add their perspective
              </p>
            </div>
          )}

          {/* Username Input */}
          {inviteMethod === 'username' && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">@</span>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                They'll receive a notification to add their perspective
              </p>
            </div>
          )}

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Hey, you were there too. Would you like to share your perspective?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
            <p className="text-sm">
              You've been invited to add your perspective on: <strong>"{experienceTitle}"</strong>
            </p>
            {message && (
              <p className="text-sm mt-2 italic text-muted-foreground">"{message}"</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isPending}>
            {isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
