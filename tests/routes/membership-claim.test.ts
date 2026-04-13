import { test, expect } from '@playwright/test'

test.describe('Membership AI/AM claim route', () => {
  test.describe('POST /api/membership/claim-ai-am', () => {
    test('rejects unauthenticated request', async ({ request }) => {
      const response = await request.post('/api/membership/claim-ai-am')

      expect(response.status()).toBe(401)
      const body = await response.json()
      expect(body.errors).toBeDefined()
      expect(body.errors[0].message).toBe('Unauthorized')
    })
  })
})
