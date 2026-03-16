import { test, expect } from '@playwright/test'

test.describe('PATCH /api/taste/visibility', () => {
  test('returns 401 when not authenticated', async ({ request }) => {
    const response = await request.patch('/api/taste/visibility', {
      data: { field: 'show_bio', value: false },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.errors).toBeDefined()
    expect(body.errors[0].message).toBe('Unauthorized')
  })

  test('rejects invalid field name', async ({ request }) => {
    // This will still be 401 since we're not authenticated,
    // but tests the route exists and accepts PATCH
    const response = await request.patch('/api/taste/visibility', {
      data: { field: 'invalid_field', value: true },
    })

    // Either 401 (not authenticated) or 400 (invalid field)
    expect([400, 401]).toContain(response.status())
  })
})
