import { test, expect } from '@playwright/test'

test.describe('POST /api/taste/evaluate', () => {
  test('rejects unauthenticated request', async ({ request }) => {
    const response = await request.post('/api/taste/evaluate', {
      data: { userId: '00000000-0000-0000-0000-000000000000' },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.errors).toBeDefined()
    expect(body.errors[0].message).toBe('Unauthorized')
  })

  test('rejects request with missing body', async ({ request }) => {
    const response = await request.post('/api/taste/evaluate', {
      data: {},
    })

    // 401 because auth check comes before validation
    expect(response.status()).toBe(401)
  })
})
