import { test, expect } from '@playwright/test'

test.describe('GET /api/taste/status', () => {
  test('returns 401 when not authenticated', async ({ request }) => {
    const response = await request.get('/api/taste/status')

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.errors).toBeDefined()
    expect(body.errors[0].message).toBe('Unauthorized')
  })
})
