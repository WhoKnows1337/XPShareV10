'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarUpload } from './avatar-upload'
import { Loader2 } from 'lucide-react'

interface ProfileEditFormProps {
  userId: string
  initialData: {
    username: string
    displayName: string
    bio?: string
    avatarUrl?: string
    locationCity?: string
    locationCountry?: string
  }
}

export function ProfileEditForm({ userId, initialData }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    display_name: initialData.displayName,
    bio: initialData.bio || '',
    avatar_url: initialData.avatarUrl || '',
    location_city: initialData.locationCity || '',
    location_country: initialData.locationCountry || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/profile/${initialData.username}`)
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your profile information and avatar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="alert">
              Profile updated successfully! Redirecting...
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex justify-center">
            <AvatarUpload
              userId={userId}
              currentAvatarUrl={formData.avatar_url}
              username={initialData.username}
              onUploadComplete={handleAvatarUpload}
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              type="text"
              value={formData.display_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, display_name: e.target.value }))
              }
              maxLength={50}
              aria-required="true"
            />
            <p className="text-xs text-slate-500">
              This is how your name will appear to others
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself..."
              maxLength={500}
              rows={4}
              aria-describedby="bio-hint"
            />
            <p id="bio-hint" className="text-xs text-slate-500">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Location */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location_city">City</Label>
              <Input
                id="location_city"
                type="text"
                value={formData.location_city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location_city: e.target.value }))
                }
                placeholder="Berlin"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_country">Country</Label>
              <Input
                id="location_country"
                type="text"
                value={formData.location_country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location_country: e.target.value,
                  }))
                }
                placeholder="Germany"
                maxLength={100}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/profile/${initialData.username}`)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
