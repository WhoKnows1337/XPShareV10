import { ProfileSkeleton } from '@/components/profile/profile-skeleton'

/**
 * Loading state for profile pages
 *
 * Shown during:
 * - Initial page load
 * - Server-side data fetching
 * - Navigation between profiles
 *
 * Uses ProfileSkeleton component with shimmer animations
 * to provide smooth loading UX
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-space-deep">
      <ProfileSkeleton />
    </div>
  )
}
