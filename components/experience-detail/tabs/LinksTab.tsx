'use client';

import { motion } from 'framer-motion';
import { Link2 } from 'lucide-react';
import { LinkPreviewCard, type LinkPreviewCardProps } from '../LinkPreviewCard';

interface LinksTabProps {
  links: LinkPreviewCardProps[];
}

/**
 * Links Tab Component
 * Displays external links with rich previews
 */
export function LinksTab({ links }: LinksTabProps) {
  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground space-y-2">
          <Link2 className="h-12 w-12 mx-auto opacity-20" />
          <p className="text-sm">No external links attached</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link, index) => (
        <motion.div
          key={link.url}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <LinkPreviewCard {...link} />
        </motion.div>
      ))}
    </div>
  );
}
