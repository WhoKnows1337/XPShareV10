import { ProfileSkeleton } from '@/components/profile/profile-skeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <ProfileSkeleton />
    </div>
  )
}
