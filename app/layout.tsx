import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
