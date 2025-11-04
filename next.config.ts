import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'pub-8df3db6388144d60abdb82837a210183.r2.dev',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // 1 minute cache for images
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,

  // Performance optimizations
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },

  // Fix for Next.js 15 RSC Bundler with Mapbox GL in streamUI
  serverExternalPackages: ['mapbox-gl', 'react-map-gl'],

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@ai-sdk/openai', '@ai-sdk/react', 'recharts', 'lucide-react'],
  },
};

export default withNextIntl(nextConfig);
