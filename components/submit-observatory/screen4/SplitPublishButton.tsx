'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, UserX, Lock, Send, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SplitPublishButtonProps {
  onPublish: (visibility: 'public' | 'anonymous' | 'private') => void;
}

export function SplitPublishButton({ onPublish }: SplitPublishButtonProps) {
  const t = useTranslations('submit.screen4.publish');
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
    if (isFirstTime && showTooltip) {
      localStorage.setItem('xpshare-split-button-seen', 'true');
      setIsFirstTime(false);
    }
    onPublish(selectedVisibility);
  };

  const visibilityConfig = {
    public: {
      icon: Globe,
      label: t('public', 'Öffentlich'),
      description: t('publicDesc', 'Alle können diese Erfahrung sehen'),
      color: 'text-success-soft',
      bgColor: 'bg-success-soft/10',
      borderColor: 'border-success-soft/30',
    },
    anonymous: {
      icon: UserX,
      label: t('anonymous', 'Anonym'),
      description: t('anonymousDesc', 'Öffentlich, aber ohne deinen Namen'),
      color: 'text-observatory-gold',
      bgColor: 'bg-observatory-gold/10',
      borderColor: 'border-observatory-gold/30',
    },
    private: {
      icon: Lock,
      label: t('private', 'Privat'),
      description: t('privateDesc', 'Nur du kannst diese Erfahrung sehen'),
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
      {isFirstTime && showTooltip && (
        <div className="absolute bottom-full right-0 mb-4 w-72 p-4 bg-observatory-gold/95 backdrop-blur-sm border border-observatory-gold rounded-lg shadow-xl animate-tooltip-bounce z-50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-space-deep flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-space-deep mb-1">
                {t('tooltipTitle', 'Tipp: Sichtbarkeit wählen')}
              </div>
              <div className="text-xs text-space-deep/80">
                {t(
                  'tooltipDesc',
                  'Klicke auf den Pfeil um die Sichtbarkeit zu ändern: Öffentlich, Anonym oder Privat.'
                )}
              </div>
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-observatory-gold/95 border-r border-b border-observatory-gold rotate-45" />
        </div>
      )}

      {/* Split Button */}
      <div className="flex items-stretch overflow-hidden rounded-lg shadow-lg">
        {/* Main Publish Button */}
        <button
          onClick={handlePublish}
          className="btn-observatory px-8 py-4 rounded-r-none border-r border-observatory-gold/30 hover:bg-gradient-to-r hover:from-observatory-gold/30 hover:to-observatory-gold/20 transition-all group"
        >
          <Send className="w-5 h-5 mr-2 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-semibold">{t('publish', 'Veröffentlichen')}</span>
        </button>

        {/* Dropdown Toggle */}
        <button
          onClick={handleMenuToggle}
          className="btn-observatory px-4 py-4 rounded-l-none hover:bg-gradient-to-r hover:from-observatory-gold/20 hover:to-observatory-gold/30 transition-all"
          aria-label="Select visibility"
        >
          <ChevronDown
            className={`w-5 h-5 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Visibility Menu */}
      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 w-80 glass-card p-2 shadow-xl animate-slide-up z-40">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wide px-3 py-2">
            {t('selectVisibility', 'Sichtbarkeit wählen')}
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
                {t('current', 'Aktuell')}: <span className="font-medium">{currentConfig.label}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
