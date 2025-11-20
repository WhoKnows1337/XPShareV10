'use client';

import { Bell, Map, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface NextActionsProps {
  experienceId: string;
  categoryId?: string;
  patternId?: string;
}

export function NextActions({ experienceId, categoryId, patternId }: NextActionsProps) {
  const t = useTranslations('submit.success.actions');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowPattern = async () => {
    if (!patternId) {
      toast.error(t('followPattern.noPattern'));
      return;
    }

    try {
      // TODO: Implement actual pattern following API
      setIsFollowing(true);
      toast.success(t('followPattern.success'), {
        description: t('followPattern.successDesc'),
      });
    } catch (error) {
      console.error('Failed to follow pattern:', error);
      toast.error(t('followPattern.error'));
      setIsFollowing(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '600ms' }}>
      {/* Follow Pattern */}
      <button
        onClick={handleFollowPattern}
        disabled={!patternId || isFollowing}
        className={`glass-card p-4 transition-all group
                   ${
                     !patternId || isFollowing
                       ? 'opacity-50 cursor-not-allowed'
                       : 'hover:bg-space-deep/60'
                   }`}>
        <div className="flex flex-col items-center gap-2 text-center">
          <Bell
            className={`w-5 h-5 text-observatory-gold transition-transform
                       ${!patternId || isFollowing ? '' : 'group-hover:scale-110'}`}
          />
          <span className="text-sm font-semibold text-text-primary">
            {isFollowing ? t('followPattern.following') : t('followPattern.title')}
          </span>
          <span className="text-xs text-text-tertiary">
            {t('followPattern.desc')}
          </span>
        </div>
      </button>

      {/* Explore Map */}
      <Link
        href={patternId ? `/map?pattern=${patternId}` : `/map?experience=${experienceId}`}
        className="glass-card p-4 hover:bg-space-deep/60 transition-all group">
        <div className="flex flex-col items-center gap-2 text-center">
          <Map
            className="w-5 h-5 text-text-secondary
                       group-hover:scale-110 group-hover:text-text-primary
                       transition-all"
          />
          <span className="text-sm font-semibold text-text-primary">
            {t('exploreMap.title')}
          </span>
          <span className="text-xs text-text-tertiary">
            {t('exploreMap.desc')}
          </span>
        </div>
      </Link>

      {/* Join Discussion */}
      <Link
        href={categoryId ? `/discussions?topic=${categoryId}` : '/discussions'}
        className="glass-card p-4 hover:bg-space-deep/60 transition-all group">
        <div className="flex flex-col items-center gap-2 text-center">
          <MessageCircle
            className="w-5 h-5 text-text-secondary
                       group-hover:scale-110 group-hover:text-text-primary
                       transition-all"
          />
          <span className="text-sm font-semibold text-text-primary">
            {t('joinDiscussion.title')}
          </span>
          <span className="text-xs text-text-tertiary">
            {t('joinDiscussion.desc')}
          </span>
        </div>
      </Link>
    </div>
  );
}
