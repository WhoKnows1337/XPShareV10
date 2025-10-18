import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, Users, ArrowRight, Telescope, GitBranch, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');
  return (
    <main className="flex min-h-screen flex-col bg-space-deep relative">
      {/* Hero Section with Starfield */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 relative overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-deep/50 to-space-deep pointer-events-none" />

        <div className="max-w-5xl text-center relative z-10">
          {/* Icon with Glow */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-observatory-gold/30 blur-3xl animate-pulse" />
              <Telescope className="h-20 w-20 text-observatory-gold relative animate-gentle-glow" aria-hidden="true" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-text-primary">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="btn-observatory w-full sm:w-auto group">
                {t('hero.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto glass-card border-glass-border hover:border-observatory-gold/50 text-text-primary hover:text-observatory-gold"
              >
                {t('hero.signIn')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-observatory-gold" />
              <span>{t('stats.experiences')}</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-observatory-gold" />
              <span>{t('stats.aiMatching')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-observatory-gold" />
              <span>{t('stats.gamified')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-glass-border px-4 py-20 relative">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-text-secondary">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="glass-card p-8 group hover:border-observatory-gold/50 transition-all">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-observatory-gold/10 border border-observatory-gold/30 p-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-observatory-gold" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary text-center group-hover:text-observatory-gold transition-colors">
                {t('features.share.title')}
              </h3>
              <p className="text-text-secondary text-center">
                {t('features.share.description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 group hover:border-observatory-gold/50 transition-all">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-observatory-gold/10 border border-observatory-gold/30 p-4 group-hover:scale-110 transition-transform">
                  <Search className="h-8 w-8 text-observatory-gold" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary text-center group-hover:text-observatory-gold transition-colors">
                {t('features.discover.title')}
              </h3>
              <p className="text-text-secondary text-center">
                {t('features.discover.description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 group hover:border-observatory-gold/50 transition-all">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-observatory-gold/10 border border-observatory-gold/30 p-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-observatory-gold" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary text-center group-hover:text-observatory-gold transition-colors">
                {t('features.community.title')}
              </h3>
              <p className="text-text-secondary text-center">
                {t('features.community.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-glass-border px-4 py-20 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-observatory-gold/10 via-transparent to-observatory-gold/5 pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="glass-card p-12">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-text-primary">
              {t('cta.title')}
            </h2>
            <p className="mb-8 text-lg text-text-secondary">
              {t('cta.subtitle')}
            </p>
            <Link href="/signup">
              <Button size="lg" className="btn-observatory w-full sm:w-auto group">
                {t('cta.signup')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-soft" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('trust.free')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-soft" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('trust.noCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-soft" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('trust.privacy')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
