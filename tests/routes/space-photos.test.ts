import { test, expect } from '@playwright/test'

test.describe('Space photos routes', () => {
  test.describe('GET /api/space-photos', () => {
    test('is public and returns an array', async ({ request }) => {
      const response = await request.get('/api/space-photos')

      expect(response.status()).toBe(200)
      const body = await response.json()
      expect(Array.isArray(body)).toBe(true)
    })
  })

  test.describe('POST /api/space-photos', () => {
    test('rejects unauthenticated upload', async ({ request }) => {
      const response = await request.post('/api/space-photos', {
        multipart: {
          file: {
            name: 'pixel.png',
            mimeType: 'image/png',
            buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
          },
        },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('PATCH /api/space-photos/:id', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.patch(
        '/api/space-photos/00000000-0000-0000-0000-000000000000',
        { data: { caption: 'hello' } }
      )

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('DELETE /api/space-photos/:id', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.delete(
        '/api/space-photos/00000000-0000-0000-0000-000000000000'
      )

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('PUT /api/space-photos/reorder', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.put('/api/space-photos/reorder', {
        data: { ids: ['00000000-0000-0000-0000-000000000000'] },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })
})
