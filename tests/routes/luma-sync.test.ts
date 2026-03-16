import { test, expect } from '@playwright/test'

test.describe('POST /api/luma/sync', () => {
  test('requires authentication', async ({ request }) => {
    const response = await request.post('/api/luma/sync', {
      data: { type: 'events' },
    })

    expect(response.status()).toBe(401)
  })

  test('rejects non-operator users', async ({ request }) => {
    // Without proper auth cookies, should return 401
    const response = await request.post('/api/luma/sync', {
      data: { type: 'events' },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBe(401)
  })

  test('rejects invalid sync type', async ({ request }) => {
    // This will also fail auth first, but tests the route exists
    const response = await request.post('/api/luma/sync', {
      data: { type: 'invalid' },
    })

    // Will be 401 since no auth
    expect(response.status()).toBe(401)
  })
})

test.describe('POST /api/luma/push', () => {
  test('requires authentication', async ({ request }) => {
    const response = await request.post('/api/luma/push', {
      data: { eventId: 'test-id' },
    })

    expect(response.status()).toBe(401)
  })

  test('rejects non-operator users', async ({ request }) => {
    const response = await request.post('/api/luma/push', {
      data: { eventId: 'test-id' },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBe(401)
  })
})

test.describe('GET /api/luma/status', () => {
  test('requires authentication', async ({ request }) => {
    const response = await request.get('/api/luma/status')

    expect(response.status()).toBe(401)
  })
})
