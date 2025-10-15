'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Sparkles, Search, Shield, ChevronDown, FolderOpen, Plus, History } from 'lucide-react';
import { NotificationsDropdown } from './notifications-dropdown';
import { LanguageSwitcher } from './language-switcher';
import { CommandPalette } from '@/components/browse/command-palette';
import { useTranslations } from 'next-intl';

const categories = [
  { slug: 'ufo', name: 'UFO Sichtungen', icon: '🛸' },
  { slug: 'paranormal', name: 'Paranormal', icon: '👻' },
  { slug: 'dreams', name: 'Träume', icon: '💭' },
  { slug: 'psychedelic', name: 'Psychedelic', icon: '🍄' },
  { slug: 'spiritual', name: 'Spiritual', icon: '🙏' },
  { slug: 'synchronicity', name: 'Synchronicity', icon: '🔮' },
  { slug: 'nde', name: 'Near-Death', icon: '💫' },
  { slug: 'other', name: 'Other', icon: '📦' },
];

export function Navbar() {
  const { user, signOut, loading, isAdmin } = useAuth();
  const t = useTranslations('nav');

  const getInitials = (email: string) => {
    return (
      email
        .split('@')[0]
        ?.slice(0, 2)
        .toUpperCase() || 'U'
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-glass-border bg-space-deep/95 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="h-6 w-6 text-observatory-gold group-hover:animate-gentle-glow" aria-hidden="true" />
          <span className="text-xl font-bold text-text-primary group-hover:text-observatory-gold transition-colors">
            XP-Share
          </span>
        </Link>

        {/* Command Palette + Navigation Links (only if logged in) */}
        {user && (
          <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4">
            <CommandPalette />
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/feed"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-observatory-gold"
              >
                {t('feed')}
              </Link>

              <Link
                href="/search"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-observatory-gold flex items-center gap-1"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>

              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-text-secondary hover:text-observatory-gold hover:bg-observatory-gold/10"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Categories
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 glass-card border-glass-border bg-space-deep/95 backdrop-blur-lg"
                >
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.slug} asChild>
                      <Link
                        href={`/categories/${category.slug}`}
                        className="cursor-pointer flex items-center gap-2 text-text-secondary hover:text-observatory-gold hover:bg-observatory-gold/10 focus:text-observatory-gold focus:bg-observatory-gold/10"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span>{category.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-observatory-gold/20 to-observatory-gold/10 border border-observatory-gold/30 text-sm font-medium text-observatory-gold hover:from-observatory-gold/30 hover:to-observatory-gold/20 transition-all"
              >
                <Plus className="h-4 w-4" />
                {t('submit')}
              </Link>

              <Link
                href="/map"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-observatory-gold"
              >
                {t('map')}
              </Link>
            </div>
          </div>
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-observatory-gold/20" />
          ) : user ? (
            <>
              <NotificationsDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-observatory-gold focus:ring-offset-2 focus:ring-offset-space-deep"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8 border-2 border-observatory-gold/30 hover:border-observatory-gold transition-colors">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                      <AvatarFallback className="text-xs bg-observatory-gold/20 text-observatory-gold">
                        {getInitials(user.email || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 glass-card border-glass-border bg-space-deep/95 backdrop-blur-lg"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-text-primary">{user.email}</p>
                    <p className="text-xs text-text-tertiary">@{user.user_metadata?.username || 'user'}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-glass-border" />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/profile/${user.id}`}
                      className="cursor-pointer text-text-secondary hover:text-observatory-gold hover:bg-observatory-gold/10 focus:text-observatory-gold focus:bg-observatory-gold/10"
                    >
                      <User className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t('profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="cursor-pointer text-text-secondary hover:text-observatory-gold hover:bg-observatory-gold/10 focus:text-observatory-gold focus:bg-observatory-gold/10"
                    >
                      <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/search/history"
                      className="cursor-pointer text-text-secondary hover:text-observatory-gold hover:bg-observatory-gold/10 focus:text-observatory-gold focus:bg-observatory-gold/10"
                    >
                      <History className="mr-2 h-4 w-4" aria-hidden="true" />
                      Search History
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="cursor-pointer text-text-secondary hover:text-observatory-gold hover:bg-observatory-gold/10 focus:text-observatory-gold focus:bg-observatory-gold/10"
                      >
                        <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                        {t('admin')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-glass-border" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10"
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-observatory-gold hover:bg-observatory-gold/10"
                >
                  {t('login')}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="btn-observatory">
                  {t('signup')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
