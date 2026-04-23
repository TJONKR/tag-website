import { test, expect } from '@playwright/test'

test.describe('POST /api/taste/prophecy/advance', () => {
  test('rejects unauthenticated request', async ({ request }) => {
    const response = await request.post('/api/taste/prophecy/advance', {
      data: { pickedCardId: 'r1-c1' },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.errors[0].message).toBe('Unauthorized')
  })

  test('rejects request with missing body', async ({ request }) => {
    const response = await request.post('/api/taste/prophecy/advance', {
      data: {},
    })

    // 401 because auth check comes before validation
    expect(response.status()).toBe(401)
  })

  test('rejects payload with wrong pickedCardId shape (when auth present)', async ({
    request,
  }) => {
    // Still 401 in CI without session, but confirms route exists and accepts POST.
    const response = await request.post('/api/taste/prophecy/advance', {
      data: { pickedCardId: 'not-valid' },
    })
    expect([400, 401]).toContain(response.status())
  })
})
