import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categoryLabels: Record<string, string> = {
  ufo: 'UFO Sighting',
  paranormal: 'Paranormal',
  dreams: 'Dream Experience',
  psychedelic: 'Psychedelic',
  spiritual: 'Spiritual',
  synchronicity: 'Synchronicity',
  nde: 'Near-Death Experience',
  other: 'Other Experience',
};

const categoryEmojis: Record<string, string> = {
  ufo: '🛸',
  paranormal: '👻',
  dreams: '💭',
  psychedelic: '🍄',
  spiritual: '🙏',
  synchronicity: '🔮',
  nde: '💫',
  other: '📦',
};

interface ExperienceCardProps {
  experience: {
    id: string;
    title: string;
    story_text: string;
    category: string;
    tags: string[];
    location_text?: string;
    date_occurred?: string;
    time_of_day?: string;
    view_count: number;
    upvote_count: number;
    comment_count: number;
    created_at: string;
    user_profiles?: {
      username: string;
      display_name: string;
      avatar_url?: string;
    } | null;
  };
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const profile = experience.user_profiles;
  const displayName = profile?.display_name || profile?.username || 'Anonymous';
  const initials = displayName.substring(0, 2).toUpperCase();

  // Truncate story text to ~150 characters
  const truncatedText =
    experience.story_text.length > 150
      ? experience.story_text.substring(0, 150) + '...'
      : experience.story_text;

  return (
    <Link href={`/experiences/${experience.id}`} className="block h-full">
      <div className="glass-card p-5 h-full transition-all hover:border-observatory-gold/50 hover:shadow-xl hover:scale-[1.02] cursor-pointer group">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-8 w-8 border-2 border-observatory-gold/30 group-hover:border-observatory-gold transition-colors">
            <AvatarFallback className="text-xs bg-observatory-gold/20 text-observatory-gold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
            <p className="text-xs text-text-tertiary">
              {formatDistanceToNow(new Date(experience.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-observatory-gold/10 border border-observatory-gold/30 shrink-0">
            <span className="text-sm">{categoryEmojis[experience.category] || '📦'}</span>
            <span className="text-xs font-medium text-observatory-gold hidden sm:inline">
              {categoryLabels[experience.category] || experience.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary line-clamp-2 mb-3 group-hover:text-observatory-gold transition-colors">
          {experience.title}
        </h3>

        {/* Story Preview */}
        <p className="text-sm text-text-secondary line-clamp-3 mb-4">{truncatedText}</p>

        {/* Tags */}
        {experience.tags && experience.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {experience.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded bg-space-deep/60 border border-glass-border text-text-tertiary"
              >
                {tag}
              </span>
            ))}
            {experience.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs rounded bg-space-deep/60 border border-glass-border text-text-tertiary">
                +{experience.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-text-tertiary mb-4">
          {experience.date_occurred && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-observatory-gold" />
              <span>{experience.date_occurred}</span>
            </div>
          )}
          {experience.location_text && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-observatory-gold" />
              <span className="truncate max-w-[150px]">{experience.location_text}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-glass-border text-xs text-text-tertiary">
          <div className="flex items-center gap-1 hover:text-observatory-gold transition-colors">
            <Eye className="h-3.5 w-3.5" />
            <span>{experience.view_count || 0}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-observatory-gold transition-colors">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{experience.upvote_count || 0}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-observatory-gold transition-colors">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{experience.comment_count || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
