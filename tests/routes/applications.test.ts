import { test, expect } from '@playwright/test'

test.describe('Application routes', () => {
  test.describe('GET /api/applications', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/applications')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('PATCH /api/applications/:id', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.patch(
        '/api/applications/00000000-0000-0000-0000-000000000000',
        {
          data: { status: 'accepted' },
        }
      )

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('POST /api/applications/invite', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/applications/invite', {
        data: { email: 'test@example.com', name: 'Test User' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })
})
