import { test, expect } from '@playwright/test'

test.describe('Event routes', () => {
  test.describe('POST /api/events', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/events', {
        data: {
          title: 'Test Event',
          date: '2026-04-01T18:00:00Z',
          location: 'TAG Amsterdam',
        },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })
})
