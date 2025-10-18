'use client'

import { UnifiedSearchBar } from './unified-search-bar'
import { Button } from '@/components/ui/button'
import { Globe, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CompactSearchHeaderProps {
  query: string
  onQueryChange: (value: string) => void
  onSearch: (query: string) => void
  isLoading?: boolean
  askMode?: boolean
  onAskModeToggle?: () => void
  searchScope?: 'all' | 'my' | 'following'
  onScopeChange?: (scope: 'all' | 'my' | 'following') => void
}

/**
 * Compact Search Header - Results State
 *
 * Small, efficient header for when results are showing
 * ~80px vs ~400px original
 */
export function CompactSearchHeader({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  askMode,
  onAskModeToggle,
  searchScope = 'all',
  onScopeChange,
}: CompactSearchHeaderProps) {
  const t = useTranslations('search')

  return (
    <div className="space-y-3">
      {/* Compact Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <UnifiedSearchBar
            value={query}
            onChange={onQueryChange}
            onSearch={onSearch}
            isLoading={isLoading}
            askMode={askMode}
            onAskModeToggle={onAskModeToggle}
            placeholder={askMode ? t('askPlaceholder') : t('placeholder')}
          />
        </div>
      </div>

      {/* Compact Scope Tabs */}
      {onScopeChange && (
        <div className="flex items-center gap-2">
          <Button
            variant={searchScope === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onScopeChange('all')}
            className={cn(
              'h-8 transition-all duration-200',
              searchScope === 'all' && 'shadow-sm'
            )}
          >
            <Globe className="h-3 w-3 mr-1.5" />
            {t('scope.all')}
          </Button>
          <Button
            variant={searchScope === 'my' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onScopeChange('my')}
            className={cn(
              'h-8 transition-all duration-200',
              searchScope === 'my' && 'shadow-sm'
            )}
          >
            <User className="h-3 w-3 mr-1.5" />
            {t('scope.my')}
          </Button>
          <Button
            variant={searchScope === 'following' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onScopeChange('following')}
            className={cn(
              'h-8 transition-all duration-200',
              searchScope === 'following' && 'shadow-sm'
            )}
          >
            <Users className="h-3 w-3 mr-1.5" />
            {t('scope.following')}
          </Button>
        </div>
      )}
    </div>
  )
}
