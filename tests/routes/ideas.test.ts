import { test, expect } from '@playwright/test'

test.describe('Ideas routes', () => {
  test.describe('POST /api/ideas', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/ideas', {
        data: { title: 'New idea', body: 'A description', category: 'feature' },
      })

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('GET /api/ideas/mine', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.get('/api/ideas/mine')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })

  test.describe('GET /api/admin/ideas', () => {
    test('rejects unauthenticated request with 403', async ({ request }) => {
      const response = await request.get('/api/admin/ideas')

      expect(response.status()).toBe(403)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Forbidden')
    })

    test('rejects invalid status filter for unauthenticated user with 403', async ({ request }) => {
      const response = await request.get('/api/admin/ideas?status=bogus')

      // Auth check fires before validation
      expect(response.status()).toBe(403)
    })
  })

  test.describe('PATCH /api/admin/ideas/:id', () => {
    test('rejects unauthenticated request with 403', async ({ request }) => {
      const response = await request.patch(
        '/api/admin/ideas/00000000-0000-0000-0000-000000000000',
        { data: { status: 'in_review' } }
      )

      expect(response.status()).toBe(403)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Forbidden')
    })
  })
})
