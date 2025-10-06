import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/*/edit',
        ],
      },
    ],
    sitemap: 'https://xp-share.com/sitemap.xml',
  }
}
