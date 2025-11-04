'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Video, Music, Link2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { PhotosTab, type Photo } from './tabs/PhotosTab';
import { VideosTab, type VideoItem } from './tabs/VideosTab';
import { AudioTab, type AudioItem } from './tabs/AudioTab';
import { LinksTab } from './tabs/LinksTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import type { LinkPreviewCardProps } from './LinkPreviewCard';
import type { DocumentPreviewProps } from './DocumentPreview';

interface MediaTabsSectionProps {
  photos?: Photo[];
  videos?: VideoItem[];
  audio?: AudioItem[];
  externalLinks?: LinkPreviewCardProps[];
  documents?: DocumentPreviewProps[];
}

/**
 * Media Tabs Section Component
 * Container for all media types with tabbed interface
 */
export function MediaTabsSection({
  photos = [],
  videos = [],
  audio = [],
  externalLinks = [],
  documents = [],
}: MediaTabsSectionProps) {
  // Calculate totals
  const totalMedia = photos.length + videos.length + audio.length + externalLinks.length + documents.length;

  // If no media at all, don't render the section
  if (totalMedia === 0) {
    return null;
  }

  // Determine default tab (first non-empty tab)
  const defaultTab = photos.length > 0 ? 'photos'
    : videos.length > 0 ? 'videos'
    : audio.length > 0 ? 'audio'
    : externalLinks.length > 0 ? 'links'
    : documents.length > 0 ? 'documents'
    : 'photos';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Media & Links</h2>
        <Badge variant="secondary">{totalMedia} items</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {/* Photos Tab */}
          <TabsTrigger value="photos" className="gap-2" disabled={photos.length === 0}>
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Photos</span>
            {photos.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {photos.length}
              </Badge>
            )}
          </TabsTrigger>

          {/* Videos Tab */}
          <TabsTrigger value="videos" className="gap-2" disabled={videos.length === 0}>
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
            {videos.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {videos.length}
              </Badge>
            )}
          </TabsTrigger>

          {/* Audio Tab */}
          <TabsTrigger value="audio" className="gap-2" disabled={audio.length === 0}>
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">Audio</span>
            {audio.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {audio.length}
              </Badge>
            )}
          </TabsTrigger>

          {/* Links Tab */}
          <TabsTrigger value="links" className="gap-2" disabled={externalLinks.length === 0}>
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Links</span>
            {externalLinks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {externalLinks.length}
              </Badge>
            )}
          </TabsTrigger>

          {/* Documents Tab */}
          <TabsTrigger value="documents" className="gap-2" disabled={documents.length === 0}>
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
            {documents.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="photos" className="mt-6">
          <PhotosTab photos={photos} />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <VideosTab videos={videos} />
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <AudioTab audio={audio} />
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          <LinksTab links={externalLinks} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsTab documents={documents} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
