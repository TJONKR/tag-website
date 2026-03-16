import { test, expect } from '@playwright/test'

test.describe('Profile routes', () => {
  test.describe('PATCH /api/profile/update', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.patch('/api/profile/update', {
        data: { building: 'Test project' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('GET /api/profile/photos', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/profile/photos')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('POST /api/profile/photos', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/profile/photos')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })

  test.describe('DELETE /api/profile/photos', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.delete('/api/profile/photos', {
        data: { photoId: 'test' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })
  })
})
