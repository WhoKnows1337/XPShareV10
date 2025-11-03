'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon } from 'lucide-react';
import { LinkInput } from '@/components/links/LinkInput';
import { LinkPreview } from '@/components/links/LinkPreview';
import type { LinkMetadata } from '@/lib/types/link-preview';

export interface LinkSectionProps {
  onLinksChange?: (links: LinkMetadata[]) => void;
}

export function LinkSection({ onLinksChange }: LinkSectionProps) {
  const t = useTranslations('submit.screen4.filesWitnesses');
  const [links, setLinks] = useState<LinkMetadata[]>([]);

  const handleLinkAdded = (metadata: LinkMetadata) => {
    const newLinks = [...links, metadata];
    setLinks(newLinks);
    onLinksChange?.(newLinks);
  };

  const handleLinkRemove = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onLinksChange?.(newLinks);
  };

  return (
    <div className="card-observatory p-3 sm:p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-observatory-gold" />
        <h2 className="text-sm font-medium text-white">
          {t('linksTitle', 'External Links')}
        </h2>
        {links.length > 0 && (
          <span className="text-xs text-observatory-gold/60 bg-observatory-gold/10 px-2 py-0.5 rounded-full">
            {links.length}
          </span>
        )}
      </div>

      {/* Link Input */}
      <LinkInput onLinkAdded={handleLinkAdded} />

      {/* Links List */}
      {links.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {links.map((link, index) => (
              <motion.div
                key={`${link.url}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <LinkPreview
                  link={link}
                  onRemove={() => handleLinkRemove(index)}
                  isRemovable={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
