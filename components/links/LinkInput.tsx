'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LinkMetadata } from '@/lib/types/link-preview';

export interface LinkInputProps {
  onLinkAdded: (metadata: LinkMetadata) => void;
  disabled?: boolean;
}

export function LinkInput({ onLinkAdded, disabled = false }: LinkInputProps) {
  const t = useTranslations('submit.screen4.filesWitnesses');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Progressive loading messages
  useEffect(() => {
    if (!isLoading) {
      setLoadingMessage('');
      return;
    }

    setLoadingMessage(t('linkLoading.fetching', 'Fetching link...'));

    const timer1 = setTimeout(() => {
      setLoadingMessage(t('linkLoading.stillLoading', 'Still loading...'));
    }, 3000);

    const timer2 = setTimeout(() => {
      setLoadingMessage(t('linkLoading.almostThere', 'Almost there...'));
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLoading, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || disabled) return;

    setIsLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      // Validate URL format
      new URL(url.trim());

      // Call backend API to parse link
      const response = await fetch('/api/links/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error codes from backend
        if (errorData.code === 'TIMEOUT') {
          setErrorCode('TIMEOUT');
          setError(t('linkError.timeout', 'This link takes too long to load. Please try a different one.'));
        } else if (errorData.code === 'NETWORK_ERROR') {
          setErrorCode('NETWORK_ERROR');
          setError(t('linkError.networkError', 'Could not reach the website. Please check if the link is correct.'));
        } else if (errorData.error === 'URL security check failed') {
          setErrorCode('SECURITY');
          setError(t('linkError.security', 'This URL was blocked for security reasons.'));
        } else if (errorData.error === 'Rate limit exceeded') {
          setErrorCode('RATE_LIMIT');
          setError(t('linkError.rateLimit', 'Too many requests. Please wait a moment and try again.'));
        } else {
          setError(errorData.error || t('linkError.unknown', 'Failed to add link. Please try again.'));
        }
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        onLinkAdded(result.data);
        setUrl(''); // Clear input
        setError(null);
        setErrorCode(null);
      } else {
        setError(t('linkError.invalidResponse', 'Invalid response from server'));
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('URL')) {
        setError(t('linkError.invalidUrl', 'Invalid URL format. Please enter a valid URL.'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('linkError.unknown', 'Failed to add link. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setErrorCode(null);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-observatory-gold/60" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('linkPlaceholder', 'Paste URL (YouTube, Twitter, article, etc.)')}
              disabled={disabled || isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-observatory-gold/30 rounded-lg
                text-white placeholder:text-observatory-gold/40
                focus:outline-none focus:ring-2 focus:ring-observatory-gold/50 focus:border-observatory-gold
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!url.trim() || disabled || isLoading}
          className="px-4 py-2.5 bg-observatory-gold/20 hover:bg-observatory-gold/30
            border border-observatory-gold/30 rounded-lg
            text-observatory-gold font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">{loadingMessage}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('addLink', 'Add Link')}</span>
            </>
          )}
        </button>
      </form>

      {/* Loading Progress Message */}
      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-observatory-gold/10 border border-observatory-gold/30 rounded-lg text-observatory-gold text-sm">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <p>{loadingMessage}</p>
        </div>
      )}

      {/* Error Message with Retry */}
      {error && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              {errorCode === 'TIMEOUT' && (
                <p className="mt-1 text-xs text-red-400/70">
                  {t('linkError.timeoutHint', 'The website might be slow or unavailable. Try a different link.')}
                </p>
              )}
              {errorCode === 'NETWORK_ERROR' && (
                <p className="mt-1 text-xs text-red-400/70">
                  {t('linkError.networkHint', 'Make sure the link is accessible from a browser.')}
                </p>
              )}
              {errorCode === 'SECURITY' && (
                <p className="mt-1 text-xs text-red-400/70">
                  {t('linkError.securityHint', 'Dangerous links or file types are not allowed.')}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleRetry}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30
              border border-red-500/30 rounded-lg
              text-red-400 font-medium text-sm
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all"
          >
            {t('linkError.retry', 'Try Again')}
          </button>
        </div>
      )}

      <p className="text-xs text-observatory-gold/60">
        {t(
          'linkSupport',
          'Supported: YouTube, Vimeo, Twitter/X, Spotify, SoundCloud, TikTok, Instagram, Facebook, Google Maps, and any website'
        )}
      </p>
    </div>
  );
}
