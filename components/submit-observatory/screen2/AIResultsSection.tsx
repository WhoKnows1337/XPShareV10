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
      {/* Celebration Header */}
      <div className="mb-6 pb-6 border-b border-text-primary/10 animate-fly-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-observatory-gold/15 border border-observatory-gold/30 rounded-md animate-glow-pulse">
            <span className="text-sm font-semibold text-observatory-gold uppercase tracking-wide">
              🎯 {t('badge', 'KI-Analyse abgeschlossen')}
            </span>
          </div>
        </div>
        <p className="text-text-secondary text-sm">
          {/* Temporarily hardcoded due to browser cache issue */}
          Deine Erfahrung wurde analysiert! Wir haben automatisch Titel, Kategorie und {screen2.tags.length} relevante Tags erkannt.
        </p>
      </div>

      {/* Title */}
      <div className="mb-6 animate-fly-in-right" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            {t('title', 'TITEL')}
            <span className="text-[10px] px-2 py-0.5 bg-success-soft/20 text-success-soft rounded-full">95% Genauigkeit</span>
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
      <div className="mb-6 animate-fly-in-right" style={{ animationDelay: '200ms' }}>
        <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          <Folder className="w-4 h-4" />
          {t('category', 'KATEGORIE')}
          <span className="text-[10px] px-2 py-0.5 bg-success-soft/20 text-success-soft rounded-full">92% Genauigkeit</span>
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-4 py-2 bg-observatory-gold/15 border-2 border-observatory-gold/30 rounded-lg text-observatory-gold font-semibold animate-scale-bounce">
            ⭐ {screen2.category || t('noCategory', 'Unknown')}
          </span>
          <button className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            {t('change', 'Ändern ▼')}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="animate-fly-in-right" style={{ animationDelay: '300ms' }}>
        <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          <Tag className="w-4 h-4" />
          {t('tags', 'TAGS')}
          <span className="text-[10px] text-text-tertiary">🔗 {screen2.tags.length} Tags erkannt</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {screen2.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-observatory-gold/15 border-2 border-observatory-gold/30 rounded-full text-sm text-observatory-gold font-semibold"
            >
              #{tag}
            </span>
          ))}
          {screen2.tags.slice(3).map((tag, index) => (
            <span
              key={index + 3}
              className="px-3 py-1.5 bg-text-primary/10 border border-text-primary/20 rounded-full text-sm text-text-primary"
            >
              #{tag}
            </span>
          ))}
          <button className="px-3 py-1.5 bg-text-primary/5 border border-text-primary/15 rounded-full text-sm text-text-tertiary hover:text-text-secondary hover:bg-text-primary/10 transition-all hover:scale-105">
            + {t('addTag', 'Hinzufügen')}
          </button>
        </div>
      </div>
    </div>
  );
}
