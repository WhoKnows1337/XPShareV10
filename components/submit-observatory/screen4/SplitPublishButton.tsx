'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, UserX, Lock, Send, Info, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SplitPublishButtonProps {
  onPublish: (visibility: 'public' | 'anonymous' | 'private') => Promise<void>;
}

export function SplitPublishButton({ onPublish }: SplitPublishButtonProps) {
  const t = useTranslations('submit.screen4.publish');
  const { isPublishing } = useSubmitFlowStore();
  const [selectedVisibility, setSelectedVisibility] = useState<'public' | 'anonymous' | 'private'>('public');
  const [showMenu, setShowMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if first time using split button
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('xpshare-split-button-seen');
    if (hasSeenTooltip) {
      setIsFirstTime(false);
    } else {
      // Show tooltip after 500ms
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleMenuToggle = () => {
    if (isPublishing) return;
    setShowMenu(!showMenu);
    if (isFirstTime && showTooltip) {
      setShowTooltip(false);
      localStorage.setItem('xpshare-split-button-seen', 'true');
      setIsFirstTime(false);
    }
  };

  const handleVisibilitySelect = (visibility: 'public' | 'anonymous' | 'private') => {
    setSelectedVisibility(visibility);
    setShowMenu(false);
  };

  const handlePublish = () => {
    if (isPublishing) return;
    if (isFirstTime && showTooltip) {
      localStorage.setItem('xpshare-split-button-seen', 'true');
      setIsFirstTime(false);
    }
    onPublish(selectedVisibility);
  };

  const visibilityConfig = {
    public: {
      icon: Globe,
      label: t('public'),
      description: t('publicDesc'),
      color: 'text-success-soft',
      bgColor: 'bg-success-soft/10',
      borderColor: 'border-success-soft/30',
    },
    anonymous: {
      icon: UserX,
      label: t('anonymous'),
      description: t('anonymousDesc'),
      color: 'text-observatory-gold',
      bgColor: 'bg-observatory-gold/10',
      borderColor: 'border-observatory-gold/30',
    },
    private: {
      icon: Lock,
      label: t('private'),
      description: t('privateDesc'),
      color: 'text-text-tertiary',
      bgColor: 'bg-space-deep/50',
      borderColor: 'border-glass-border',
    },
  };

  const currentConfig = visibilityConfig[selectedVisibility];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="relative" ref={menuRef}>
      {/* First-time Tooltip */}
      {isFirstTime && showTooltip && !isPublishing && (
        <div className="absolute bottom-full right-0 mb-4 w-72 p-4 bg-observatory-gold/95 backdrop-blur-sm border border-observatory-gold rounded-lg shadow-xl animate-tooltip-bounce z-50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-space-deep flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-space-deep mb-1">
                {t('tooltipTitle')}
              </div>
              <div className="text-xs text-space-deep/80">
                {t('tooltipDesc')}
              </div>
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-observatory-gold/95 border-r border-b border-observatory-gold rotate-45" />
        </div>
      )}

      {/* Split Button */}
      <motion.div
        className="flex items-stretch overflow-hidden rounded-lg shadow-lg"
        whileHover={!isPublishing ? { scale: 1.02 } : {}}
        whileTap={!isPublishing ? { scale: 0.98 } : {}}
      >
        {/* Main Publish Button */}
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          variant="default"
          size="lg"
          className="rounded-r-none border-r border-primary/30 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              {t('publish')}
            </>
          )}
        </Button>

        {/* Dropdown Toggle */}
        <Button
          onClick={handleMenuToggle}
          disabled={isPublishing}
          variant="default"
          size="lg"
          className="rounded-l-none px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Select visibility"
        >
          <motion.div
            animate={{ rotate: showMenu ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Visibility Menu */}
      {showMenu && !isPublishing && (
        <div className="absolute bottom-full right-0 mb-2 w-80 glass-card p-2 shadow-xl animate-slide-up z-40">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wide px-3 py-2">
            {t('selectVisibility')}
          </div>

          {/* Menu Options */}
          {(Object.keys(visibilityConfig) as Array<keyof typeof visibilityConfig>).map((key) => {
            const config = visibilityConfig[key];
            const Icon = config.icon;
            const isSelected = selectedVisibility === key;

            return (
              <button
                key={key}
                onClick={() => handleVisibilitySelect(key)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                  isSelected
                    ? `${config.bgColor} border ${config.borderColor}`
                    : 'hover:bg-space-deep/60 border border-transparent'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${config.bgColor} border ${config.borderColor}`}
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {config.label}
                    </span>
                    {isSelected && <span className="text-xs text-observatory-gold">✓</span>}
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">{config.description}</div>
                </div>
              </button>
            );
          })}

          {/* Current Selection Indicator */}
          <div className="mt-2 px-3 py-2 bg-observatory-gold/5 border border-observatory-gold/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <CurrentIcon className={`w-4 h-4 ${currentConfig.color}`} />
              <span>
                {t('current')}: <span className="font-medium">{currentConfig.label}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
