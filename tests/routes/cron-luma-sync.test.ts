import { test, expect } from '@playwright/test'

test.describe('GET /api/cron/luma-sync', () => {
  test('rejects requests without authorization header', async ({ request }) => {
    const response = await request.get('/api/cron/luma-sync')

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  test('rejects requests with invalid CRON_SECRET', async ({ request }) => {
    const response = await request.get('/api/cron/luma-sync', {
      headers: { Authorization: 'Bearer invalid-secret' },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  test('rejects POST requests', async ({ request }) => {
    const response = await request.post('/api/cron/luma-sync')

    expect(response.status()).toBe(405)
  })
})
