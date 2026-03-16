import { test, expect } from '@playwright/test'

test.describe('POST /api/taste/evaluate', () => {
  test('rejects request with missing userId', async ({ request }) => {
    const response = await request.post('/api/taste/evaluate', {
      data: {},
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors).toBeDefined()
    expect(body.errors.length).toBeGreaterThan(0)
  })

  test('rejects request with invalid userId', async ({ request }) => {
    const response = await request.post('/api/taste/evaluate', {
      data: { userId: 'not-a-uuid' },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors).toBeDefined()
  })

  test('returns 404 for non-existent user', async ({ request }) => {
    const response = await request.post('/api/taste/evaluate', {
      data: { userId: '00000000-0000-0000-0000-000000000000' },
    })

    // Either 404 (no profile) or 400 (insufficient data)
    expect([400, 404]).toContain(response.status())
  })
})
