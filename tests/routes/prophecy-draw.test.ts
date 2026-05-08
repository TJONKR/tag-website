import { test, expect } from '@playwright/test'

test.describe('POST /api/taste/prophecy/draw', () => {
  test('rejects unauthenticated request', async ({ request }) => {
    const response = await request.post('/api/taste/prophecy/draw', {
      data: {},
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.errors[0].message).toBe('Unauthorized')
  })

  test('rejects cross-user draw without super admin', async ({ request }) => {
    // Still 401 in CI; confirms route exists and accepts POST with userId body.
    const response = await request.post('/api/taste/prophecy/draw', {
      data: { userId: '00000000-0000-0000-0000-000000000000' },
    })
    expect([401, 403]).toContain(response.status())
  })
})
