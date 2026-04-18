import { test, expect } from '@playwright/test'

test.describe('Public profile routes', () => {
  test.describe('GET /profile/[slug]', () => {
    test('returns 404 for unknown slug', async ({ request }) => {
      const response = await request.get(
        '/profile/this-user-does-not-exist-1234567890'
      )
      expect(response.status()).toBe(404)
    })
  })

  test.describe('GET /builders/[slug]', () => {
    test('permanent-redirects to /profile/[slug]', async ({ request }) => {
      const response = await request.get('/builders/some-builder-slug', {
        maxRedirects: 0,
      })
      // Next.js permanentRedirect returns 308
      expect([307, 308]).toContain(response.status())
      expect(response.headers()['location']).toBe('/profile/some-builder-slug')
    })
  })
})
