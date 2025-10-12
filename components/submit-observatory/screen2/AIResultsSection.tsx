'use client';

import { useState } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Edit2, FileText, Tag, Folder } from 'lucide-react';

export function AIResultsSection() {
  const t = useTranslations('submit.screen2.aiResults');
  const { screen2, updateScreen2 } = useSubmitFlowStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(screen2.title);

  const handleSaveTitle = () => {
    updateScreen2({ title: editedTitle });
    setIsEditingTitle(false);
  };

  return (
    <div className="glass-card-accent p-8">
      {/* AI Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-observatory-gold/15 border border-observatory-gold/30 rounded-md mb-6">
        <span className="text-sm font-semibold text-observatory-gold uppercase tracking-wide">
          ✨ {t('badge', 'Automatisch erkannt')}
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            {t('title', 'TITEL')}
          </label>
          {!isEditingTitle && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary hover:text-text-secondary
                         bg-text-primary/5 hover:bg-text-primary/10 border border-text-primary/10 rounded-md transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          )}
        </div>

        {isEditingTitle ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="input-observatory"
              placeholder={t('titlePlaceholder', 'Enter experience title...')}
            />
            <div className="flex gap-2">
              <button onClick={handleSaveTitle} className="btn-observatory">
                {t('save', 'Save')}
              </button>
              <button
                onClick={() => {
                  setEditedTitle(screen2.title);
                  setIsEditingTitle(false);
                }}
                className="px-4 py-2 text-sm text-text-secondary bg-text-primary/5 border border-text-primary/20 rounded-lg
                           hover:bg-text-primary/10 transition-colors"
              >
                {t('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="p-4 bg-text-primary/5 border border-text-primary/10 rounded-lg cursor-pointer
                       hover:bg-text-primary/8 hover:border-text-primary/20 transition-all"
            onClick={() => setIsEditingTitle(true)}
          >
            <p className="text-xl font-bold text-text-primary">{screen2.title || t('noTitle', 'Untitled')}</p>
          </div>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          <Folder className="w-4 h-4" />
          {t('category', 'KATEGORIE')}
        </label>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-observatory-gold/15 border border-observatory-gold/30 rounded-lg text-observatory-gold font-medium">
            {screen2.category || t('noCategory', 'Unknown')}
          </span>
          <button className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            {t('change', 'Change ▼')}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          <Tag className="w-4 h-4" />
          {t('tags', 'TAGS')}
        </label>
        <div className="flex flex-wrap gap-2">
          {screen2.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-text-primary/10 border border-text-primary/20 rounded-full text-sm text-text-primary"
            >
              {tag}
            </span>
          ))}
          <button className="px-3 py-1.5 bg-text-primary/5 border border-text-primary/15 rounded-full text-sm text-text-tertiary hover:text-text-secondary hover:bg-text-primary/10 transition-colors">
            + {t('addTag', 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}
