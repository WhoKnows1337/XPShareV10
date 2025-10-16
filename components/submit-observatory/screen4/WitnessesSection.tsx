'use client';

import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { useTranslations } from 'next-intl';
import { Users, Search, Mail, Link2, Plus } from 'lucide-react';
import { WitnessCard } from './WitnessCard';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function WitnessesSection() {
  const t = useTranslations('submit.screen4.witnesses');
  const { screen4, updateScreen4 } = useSubmitFlowStore();
  const [inputValue, setInputValue] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Smart detection: email vs username
  const isEmail = inputValue.includes('@');
  const canAdd = inputValue.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;

    if (isEmail) {
      // Add as email witness
      updateScreen4({
        witnesses: [
          ...screen4.witnesses,
          {
            type: 'email',
            email: inputValue.trim(),
            status: 'pending',
          },
        ],
      });
    } else {
      // Add as user witness
      updateScreen4({
        witnesses: [
          ...screen4.witnesses,
          {
            type: 'user',
            userId: inputValue.trim(),
            username: inputValue.trim(),
            status: 'pending',
          },
        ],
      });
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canAdd) {
      handleAdd();
    }
  };

  const handleCopyShareLink = () => {
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
    <div className="glass-card p-4 space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar">
      {/* Section Header - Compact */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-observatory-gold" />
          <h2 className="text-sm font-semibold text-text-primary">
            {t('title')}
          </h2>
        </div>

        {/* XP Motivation Badge - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2 bg-observatory-gold/10 border border-observatory-gold/30 rounded-lg"
        >
          <span className="text-sm">⭐</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-observatory-gold">
              {t('xpBonus')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Smart Input - Always Visible */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            {/* Dynamic Icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-observatory-gold transition-all">
              {isEmail ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isEmail
                  ? t('emailPlaceholder') || 'email@example.com'
                  : t('searchPlaceholder') || 'Search username...'
              }
              className="input-observatory pl-10 text-sm"
            />

            {/* Input Hint */}
            <AnimatePresence>
              {inputValue && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <span className="text-[10px] text-text-tertiary">
                    {isEmail ? 'Email' : 'Username'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="btn-observatory px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Share Link Button */}
        <button
          onClick={handleCopyShareLink}
          className="w-full glass-card-accent p-2 rounded-lg hover:bg-space-deep/40 transition-all flex items-center justify-center gap-2 text-xs border border-glass-border"
        >
          <Link2 className="w-4 h-4 text-observatory-gold" />
          <span className="text-text-secondary">
            {linkCopied ? t('linkCopied') || 'Link Copied!' : t('copyLink') || 'Copy Share Link'}
          </span>
        </button>
      </div>

      {/* Added Witnesses */}
      <AnimatePresence>
        {screen4.witnesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-3 border-t border-glass-border"
          >
            <div className="text-xs font-medium text-text-secondary flex items-center gap-2">
              <Users className="w-3 h-3" />
              {t('invited')} ({screen4.witnesses.length})
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {screen4.witnesses.map((witness, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <WitnessCard witness={witness} onRemove={() => handleRemoveWitness(index)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Note - Compact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-start gap-2 p-3 bg-success-soft/10 border border-success-soft/20 rounded-lg"
      >
        <Users className="w-4 h-4 text-success-soft flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="text-text-secondary font-medium">
            {t('info')}
          </p>
          <ul className="text-[10px] text-text-tertiary mt-1.5 space-y-0.5 ml-3 list-disc">
            <li>{t('infoPoint1')}</li>
            <li>{t('infoPoint2')}</li>
            <li>{t('infoPoint3')}</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
