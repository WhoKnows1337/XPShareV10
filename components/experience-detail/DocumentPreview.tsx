'use client';

import { FileText, Download, File } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export interface DocumentPreviewProps {
  id: string;
  url: string;
  caption?: string;
  fileName: string;
  fileSize?: number;
  type: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Document Preview Component
 * Displays PDF and document files with download capability
 */
export function DocumentPreview({
  url,
  caption,
  fileName,
  fileSize,
  type,
}: DocumentPreviewProps) {
  const isPDF = type === 'pdf' || fileName.toLowerCase().endsWith('.pdf');
  const Icon = isPDF ? FileText : File;

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-md group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* File Name & Type Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {caption || fileName}
                  </h4>
                  {caption && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {fileName}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  {isPDF ? 'PDF' : 'DOC'}
                </Badge>
              </div>

              {/* File Size */}
              {fileSize && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileSize)}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
                {isPDF && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                    className="gap-2"
                  >
                    <FileText className="h-3 w-3" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
