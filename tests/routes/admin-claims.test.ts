import { test, expect } from '@playwright/test'

test.describe('Admin claims routes', () => {
  test.describe('GET /api/admin/claims', () => {
    test('rejects unauthenticated request with 403', async ({ request }) => {
      const response = await request.get('/api/admin/claims')

      // Non-super-admin (incl. unauth) is treated as forbidden
      expect(response.status()).toBe(403)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Forbidden')
    })

    test('rejects invalid status filter', async ({ request }) => {
      const response = await request.get('/api/admin/claims?status=bogus')

      // Auth check fires before validation, so we still get 403 unauthenticated
      expect(response.status()).toBe(403)
    })
  })

  test.describe('PATCH /api/admin/claims/:id', () => {
    test('rejects unauthenticated request with 403', async ({ request }) => {
      const response = await request.patch(
        '/api/admin/claims/00000000-0000-0000-0000-000000000000',
        { data: { status: 'approved' } }
      )

      expect(response.status()).toBe(403)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Forbidden')
    })
  })
})
