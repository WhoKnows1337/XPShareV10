'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, VideoIcon, Volume2, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MediaTabsProps {
  photos?: Array<{
    id: string;
    url: string;
    caption?: string;
    isSketch?: boolean;
  }>;
  videos?: Array<{
    id: string;
    url: string;
    caption?: string;
    thumbnailUrl?: string;
  }>;
  audio?: Array<{
    id: string;
    url: string;
    caption?: string;
    duration?: number;
  }>;
  externalLinks?: Array<{
    id: string;
    url: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
  }>;
}

export function MediaTabs({ photos = [], videos = [], audio = [], externalLinks = [] }: MediaTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('photos');

  const totalMedia = photos.length + videos.length + audio.length + externalLinks.length;

  if (totalMedia === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5">
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Photos</span>
            {photos.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {photos.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <VideoIcon className="w-4 h-4" />
            <span>Videos</span>
            {videos.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {videos.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <span>Audio</span>
            {audio.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {audio.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            <span>Links</span>
            {externalLinks.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {externalLinks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Photos Tab */}
        <TabsContent value="photos" className="mt-4">
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="glass-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt={photo.caption || 'Photo'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {photo.caption && (
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">{photo.caption}</p>
                      </div>
                    )}
                    {photo.isSketch && (
                      <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                        Sketch
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No photos available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-4">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <Card key={video.id} className="glass-card overflow-hidden">
                  <CardContent className="p-0">
                    <video
                      src={video.url}
                      controls
                      className="w-full aspect-video"
                      poster={video.thumbnailUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                    {video.caption && (
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">{video.caption}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No videos available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="mt-4">
          {audio.length > 0 ? (
            <div className="space-y-4">
              {audio.map((audioItem) => (
                <Card key={audioItem.id} className="glass-card">
                  <CardContent className="p-4">
                    <audio src={audioItem.url} controls className="w-full">
                      Your browser does not support the audio tag.
                    </audio>
                    {audioItem.caption && (
                      <p className="text-xs text-muted-foreground mt-3">{audioItem.caption}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No audio available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="mt-4">
          {externalLinks.length > 0 ? (
            <div className="space-y-3">
              {externalLinks.map((link) => (
                <Card key={link.id} className="glass-card hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <Link href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex gap-4">
                        {link.thumbnailUrl && (
                          <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                            <Image
                              src={link.thumbnailUrl}
                              alt={link.title || 'Link preview'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{link.title || link.url}</p>
                          {link.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {link.description}
                            </p>
                          )}
                          <p className="text-xs text-primary mt-2 truncate">{link.url}</p>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No external links available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
