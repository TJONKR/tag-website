import { test, expect } from '@playwright/test'

test.describe('Lootbox routes', () => {
  test.describe('POST /api/lootbox/open', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/lootbox/open', {
        data: { eventSlug: 'og-day-one' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('POST /api/lootbox/choose', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/lootbox/choose', {
        data: { lootboxId: 'test', styleId: 'test' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    test('rejects request with missing fields', async ({ request }) => {
      // Even without auth, validation should trigger — but auth comes first
      const response = await request.post('/api/lootbox/choose', {
        data: {},
      })

      expect(response.status()).toBe(401)
    })
  })

  test.describe('GET /api/lootbox/status', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/lootbox/status?skinId=test')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    test('rejects request without skinId param', async ({ request }) => {
      // Auth check comes first, so we get 401
      const response = await request.get('/api/lootbox/status')

      expect(response.status()).toBe(401)
    })
  })

  test.describe('GET /api/lootbox/list', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/lootbox/list')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('GET /api/lootbox/skins', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/lootbox/skins')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('POST /api/lootbox/equip', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/lootbox/equip', {
        data: { skinId: 'test' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('POST /api/lootbox/retry', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/lootbox/retry', {
        data: { skinId: 'test' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('POST /api/lootbox/roll', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/lootbox/roll', {
        data: {},
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    test('rejects unauthenticated request with explicit lootboxId', async ({
      request,
    }) => {
      const response = await request.post('/api/lootbox/roll', {
        data: { lootboxId: 'some-id' },
      })

      expect(response.status()).toBe(401)
    })
  })
})
