import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { RootLayoutClient } from "@/components/layout/root-layout-client";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Starfield } from '@/components/layout/Starfield';
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider';
import { ConversationProvider } from '@/components/search/conversation-context';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XP-Share - Share Your Extraordinary Experiences",
  description: "Connect with others who have experienced the unexplained. Share paranormal events, UFO sightings, synchronicities, and more. Discover patterns and join a global community.",
  keywords: ['paranormal', 'UFO', 'unexplained', 'synchronicity', 'experiences', 'supernatural', 'spiritual', 'NDE', 'psychic'],
  authors: [{ name: 'XP-Share Team' }],
  creator: 'XP-Share',
  publisher: 'XP-Share',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://xp-share.com',
    title: 'XP-Share - Share Your Extraordinary Experiences',
    description: 'Connect with others who have experienced the unexplained. Share paranormal events, UFO sightings, synchronicities, and more.',
    siteName: 'XP-Share',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XP-Share - Share Your Extraordinary Experiences',
    description: 'Connect with others who have experienced the unexplained. Share paranormal events, UFO sightings, synchronicities, and more.',
  },
  alternates: {
    canonical: 'https://xp-share.com',
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Starfield />
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <ConversationProvider>
                <RootLayoutClient>
                  <ConditionalNavbar />
                  {children}
                  <Toaster position="top-right" richColors />
                  <FeedbackProvider />
                </RootLayoutClient>
              </ConversationProvider>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
