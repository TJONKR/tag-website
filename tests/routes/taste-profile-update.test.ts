import { test, expect } from '@playwright/test'

test.describe('PATCH /api/taste/profile', () => {
  test('rejects unauthenticated request', async ({ request }) => {
    const response = await request.patch('/api/taste/profile', {
      data: { headline: 'New headline' },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.errors[0].message).toBe('Unauthorized')
  })

  test('rejects invalid body when not authenticated returns 401 first', async ({
    request,
  }) => {
    // Auth check runs before validation, so even garbage body is 401 unauth'd
    const response = await request.patch('/api/taste/profile', {
      data: { headline: 123 },
    })

    expect(response.status()).toBe(401)
  })
})
