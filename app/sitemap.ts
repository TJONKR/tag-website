import type { MetadataRoute } from 'next';

import { SITE_URL } from '@lib/config/site';
import { getPublicProfileSlugs } from '@lib/auth/queries';

// Revalidate the sitemap hourly so new profiles get picked up without a redeploy.
export const revalidate = 3600;

interface StaticRoute {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/ecosystem', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/events', changeFrequency: 'daily', priority: 0.8 },
  { path: '/space', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/join', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/host-event', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/brand', changeFrequency: 'monthly', priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Profiles live in the database; failure here must not break the whole sitemap.
  let profiles: Awaited<ReturnType<typeof getPublicProfileSlugs>> = [];
  try {
    profiles = await getPublicProfileSlugs();
  } catch {
    profiles = [];
  }

  const profileEntries: MetadataRoute.Sitemap = profiles.map((profile) => ({
    url: `${SITE_URL}/profile/${profile.slug}`,
    lastModified: new Date(profile.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticEntries, ...profileEntries];
}
