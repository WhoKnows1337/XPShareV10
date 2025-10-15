'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Users, Search, Mail, Link2, Plus } from 'lucide-react';
import { WitnessCard } from './WitnessCard';
import { useState } from 'react';

type WitnessMethod = 'search' | 'email' | 'link' | null;

export function WitnessesSection() {
  const t = useTranslations('submit.screen4.witnesses');
  const { screen4, updateScreen4 } = useSubmitFlowStore();
  const [activeMethod, setActiveMethod] = useState<WitnessMethod>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleAddUserWitness = (username: string) => {
    updateScreen4({
      witnesses: [
        ...screen4.witnesses,
        {
          type: 'user',
          userId: username, // In real app, would be user ID
          username,
          status: 'pending',
        },
      ],
    });
    setSearchQuery('');
    setActiveMethod(null);
  };

  const handleAddEmailWitness = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      updateScreen4({
        witnesses: [
          ...screen4.witnesses,
          {
            type: 'email',
            email: emailInput.trim(),
            status: 'pending',
          },
        ],
      });
      setEmailInput('');
      setActiveMethod(null);
    }
  };

  const handleCopyShareLink = () => {
    // In real app, this would be a unique share link
    const shareLink = `${window.location.origin}/witness/invite/[unique-id]`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRemoveWitness = (index: number) => {
    updateScreen4({
      witnesses: screen4.witnesses.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="section-title-observatory flex items-center gap-2">
              <Users className="w-5 h-5 text-observatory-gold" />
              {t('title')}
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              {t('subtitle')}
            </p>
          </div>
        </div>
        {/* XP Motivation Badge */}
        <div className="flex items-center gap-2 p-3 bg-observatory-gold/10 border border-observatory-gold/30 rounded-lg animate-fly-in-right">
          <span className="text-lg">⭐</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-observatory-gold">
              {t('xpBonus')}
            </p>
            <p className="text-xs text-text-tertiary">
              {t('credibility')}
            </p>
          </div>
        </div>
      </div>

      {/* Add Witness Methods */}
      {!activeMethod && (
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setActiveMethod('search')}
            className="glass-card-accent p-5 hover:bg-space-deep/40 transition-all group"
          >
            <Search className="w-7 h-7 text-observatory-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-text-primary">
              {t('searchUser')}
            </div>
          </button>

          <button
            onClick={() => setActiveMethod('email')}
            className="glass-card-accent p-5 hover:bg-space-deep/40 transition-all group"
          >
            <Mail className="w-7 h-7 text-observatory-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-text-primary">
              {t('emailInvite')}
            </div>
          </button>

          <button
            onClick={() => setActiveMethod('link')}
            className="glass-card-accent p-5 hover:bg-space-deep/40 transition-all group"
          >
            <Link2 className="w-7 h-7 text-observatory-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-text-primary">
              {t('shareLink')}
            </div>
          </button>
        </div>
      )}

      {/* Search User Form */}
      {activeMethod === 'search' && (
        <div className="p-5 bg-space-deep/60 border border-glass-border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="input-observatory flex-1"
              autoFocus
            />
            <button
              onClick={() => handleAddUserWitness(searchQuery)}
              disabled={!searchQuery.trim()}
              className="btn-observatory px-5"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setActiveMethod(null)}
            className="text-xs text-text-tertiary hover:text-text-secondary"
          >
            {t('cancel')}
          </button>
        </div>
      )}

      {/* Email Invite Form */}
      {activeMethod === 'email' && (
        <div className="p-5 bg-space-deep/60 border border-glass-border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="input-observatory flex-1"
              autoFocus
            />
            <button
              onClick={handleAddEmailWitness}
              disabled={!emailInput.trim() || !emailInput.includes('@')}
              className="btn-observatory px-5"
            >
              {t('send')}
            </button>
          </div>
          <button
            onClick={() => setActiveMethod(null)}
            className="text-xs text-text-tertiary hover:text-text-secondary"
          >
            {t('cancel')}
          </button>
        </div>
      )}

      {/* Share Link */}
      {activeMethod === 'link' && (
        <div className="p-5 bg-space-deep/60 border border-glass-border rounded-lg space-y-4">
          <div className="text-sm text-text-secondary mb-3">
            {t('linkDescription')}
          </div>
          <button
            onClick={handleCopyShareLink}
            className="btn-observatory w-full"
          >
            <Link2 className="w-4 h-4 mr-2" />
            {linkCopied ? t('linkCopied') : t('copyLink')}
          </button>
          <button
            onClick={() => setActiveMethod(null)}
            className="text-xs text-text-tertiary hover:text-text-secondary"
          >
            {t('close')}
          </button>
        </div>
      )}

      {/* Added Witnesses */}
      {screen4.witnesses.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-glass-border">
          <div className="text-sm font-medium text-text-secondary">
            {t('invited')} ({screen4.witnesses.length})
          </div>
          <div className="space-y-2">
            {screen4.witnesses.map((witness, index) => (
              <WitnessCard
                key={index}
                witness={witness}
                onRemove={() => handleRemoveWitness(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-success-soft/10 border border-success-soft/20 rounded-lg">
        <Users className="w-5 h-5 text-success-soft flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-text-secondary">
            {t('info')}
          </p>
          <ul className="text-xs text-text-tertiary mt-2 space-y-1 ml-4 list-disc">
            <li>{t('infoPoint1')}</li>
            <li>{t('infoPoint2')}</li>
            <li>{t('infoPoint3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
