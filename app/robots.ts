import type { MetadataRoute } from 'next';

import { SITE_URL } from '@lib/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Authenticated, transactional and machine-only routes — keep out of the index.
      disallow: [
        '/api/',
        '/portal/',
        '/auth/',
        '/login',
        '/register',
        '/signup',
        '/forgot-password',
        '/reset-password',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
