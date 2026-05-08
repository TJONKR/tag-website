import { test, expect } from '@playwright/test'

test.describe('Event application admin routes', () => {
  test.describe('GET /api/event-applications', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/event-applications')
      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors?.[0]?.message).toBe('Unauthorized')
    })

    test('rejects unauthenticated counts request', async ({ request }) => {
      const response = await request.get('/api/event-applications?counts=true')
      expect(response.status()).toBe(401)
    })
  })

  test.describe('PATCH /api/event-applications/:id', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.patch(
        '/api/event-applications/00000000-0000-0000-0000-000000000000',
        {
          data: { status: 'approved' },
        }
      )
      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors?.[0]?.message).toBe('Unauthorized')
    })
  })
})
