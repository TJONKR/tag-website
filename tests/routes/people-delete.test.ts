import { test, expect } from '@playwright/test'

test.describe('DELETE /api/people/[id]', () => {
  test('rejects unauthenticated request', async ({ request }) => {
    const response = await request.delete('/api/people/some-user-id')

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.errors[0].message).toBe('Unauthorized')
  })
})
