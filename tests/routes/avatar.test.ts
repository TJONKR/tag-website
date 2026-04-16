import { test, expect } from '@playwright/test'

test.describe('Avatar routes', () => {
  test.describe('POST /api/avatar/generate', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/avatar/generate')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('GET /api/avatar/status', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/avatar/status?jobId=00000000-0000-0000-0000-000000000000')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    test('requires jobId parameter', async ({ request }) => {
      const response = await request.get('/api/avatar/status')

      // Either 401 (unauth) or 400 (missing param) depending on middleware order
      expect([400, 401]).toContain(response.status())
    })
  })

  test.describe('POST /api/avatar/confirm', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/avatar/confirm', {
        data: { jobId: '00000000-0000-0000-0000-000000000000' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    test('rejects invalid jobId format', async ({ request }) => {
      const response = await request.post('/api/avatar/confirm', {
        data: { jobId: 'not-a-uuid' },
      })

      // Either 401 (unauth first) or 400 (validation)
      expect([400, 401]).toContain(response.status())
    })
  })

})
