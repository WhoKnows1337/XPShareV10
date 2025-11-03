// ============================================================
// Link Preview System Types
// Unified types for external links (YouTube, Twitter, etc.)
// ============================================================

export type Platform =
  | 'youtube'
  | 'vimeo'
  | 'twitter'
  | 'spotify'
  | 'soundcloud'
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'maps'
  | 'website';

export interface LinkMetadata {
  url: string;
  platform: Platform;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  html?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface ExperienceExternalLink {
  id: string;
  experience_id: string;
  url: string;
  platform: Platform;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  html?: string;
  width?: number;
  height?: number;
  duration?: number;
  metadata_fetched_at: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface LinkPreviewProps {
  link: LinkMetadata;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export interface LinkInputProps {
  onLinkAdded: (metadata: LinkMetadata) => void;
  disabled?: boolean;
}
