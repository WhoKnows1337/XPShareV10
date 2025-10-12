'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { FileText, Tag } from 'lucide-react';

export function MetadataSection() {
  const t = useTranslations('submit.screen3.metadata');
  const { screen2 } = useSubmitFlowStore();

  return (
    <div className="glass-card p-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-text-tertiary" />
          <span className="text-lg font-bold text-text-primary">{screen2.title}</span>
        </div>
        <button className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          {t('edit', '✏️')}
        </button>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-text-tertiary flex-shrink-0" />
        {screen2.tags.map((tag, index) => (
          <span key={index}>
            <span className="text-sm text-text-secondary">{tag}</span>
            {index < screen2.tags.length - 1 && <span className="text-text-tertiary mx-1">•</span>}
          </span>
        ))}
        <button className="text-xs text-text-tertiary hover:text-text-secondary transition-colors ml-1">
          {t('editTags', '✏️')}
        </button>
      </div>
    </div>
  );
}
