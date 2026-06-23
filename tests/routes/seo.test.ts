import { test, expect } from '@playwright/test';

const SITE_URL = 'https://www.tag.space';

test.describe('SEO routes', () => {
  test.describe('GET /sitemap.xml', () => {
    test('returns a valid XML sitemap', async ({ request }) => {
      const response = await request.get('/sitemap.xml');
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('xml');

      const body = await response.text();
      expect(body).toContain('<urlset');
      // Homepage must always be present, pointed at the canonical www host.
      expect(body).toContain(`<loc>${SITE_URL}/</loc>`);
    });

    test('lists the core public pages', async ({ request }) => {
      const response = await request.get('/sitemap.xml');
      const body = await response.text();

      for (const path of ['/events', '/ecosystem', '/join', '/space']) {
        expect(body).toContain(`<loc>${SITE_URL}${path}</loc>`);
      }
    });

    test('does not expose private routes', async ({ request }) => {
      const response = await request.get('/sitemap.xml');
      const body = await response.text();

      expect(body).not.toContain('/portal');
      expect(body).not.toContain('/api/');
    });
  });

  test.describe('GET /robots.txt', () => {
    test('allows crawling and points at the sitemap', async ({ request }) => {
      const response = await request.get('/robots.txt');
      expect(response.status()).toBe(200);

      const body = await response.text();
      expect(body).toContain('User-Agent: *');
      expect(body).toContain('Allow: /');
      expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    });

    test('disallows private routes', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const body = await response.text();

      expect(body).toContain('Disallow: /portal/');
      expect(body).toContain('Disallow: /api/');
    });
  });
});
