'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User, Sparkles, Search } from 'lucide-react'
import { NotificationsDropdown } from './notifications-dropdown'
import { LanguageSwitcher } from './language-switcher'
import { useTranslations } from 'next-intl'

export function Navbar() {
  const { user, signOut, loading } = useAuth()
  const t = useTranslations('nav')

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      ?.slice(0, 2)
      .toUpperCase() || 'U'
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" aria-hidden="true" />
          <span className="text-xl font-bold">XP-Share</span>
        </Link>

        {/* Navigation Links (only if logged in) */}
        {user && (
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/feed"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-purple-600"
            >
              {t('feed')}
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-purple-600"
            >
              <Search className="h-4 w-4" />
              {t('search')}
            </Link>
            <Link
              href="/submit"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-purple-600"
            >
              {t('submit')}
            </Link>
            <Link
              href="/map"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-purple-600"
            >
              {t('map')}
            </Link>
          </div>
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
          ) : user ? (
            <>
              <NotificationsDropdown />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.email || 'User'}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.email || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-slate-500">
                    @{user.user_metadata?.username || 'user'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.id}`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">{t('signup')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
