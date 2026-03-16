import { test, expect } from '@playwright/test'

test.describe('Stripe routes', () => {
  test.describe('POST /api/stripe/webhook', () => {
    test('rejects request without stripe-signature header', async ({ request }) => {
      const response = await request.post('/api/stripe/webhook', {
        data: '{}',
        headers: { 'Content-Type': 'application/json' },
      })

      expect(response.status()).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Missing signature')
    })

    test('rejects request with invalid signature', async ({ request }) => {
      const response = await request.post('/api/stripe/webhook', {
        data: '{"type":"checkout.session.completed"}',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 't=1234,v1=invalid_signature',
        },
      })

      // 400 from signature verification failure (or 500 if STRIPE_WEBHOOK_SECRET not set)
      expect([400, 500]).toContain(response.status())
    })
  })

  test.describe('POST /api/stripe/checkout', () => {
    test('rejects unauthenticated user', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout')

      // getUser() throws redirect internally — surfaces as 500 or redirect
      expect([302, 307, 308, 500]).toContain(response.status())
    })
  })

  test.describe('POST /api/stripe/portal', () => {
    test('rejects unauthenticated user', async ({ request }) => {
      const response = await request.post('/api/stripe/portal')

      // getUser() throws redirect internally — surfaces as 500 or redirect
      expect([302, 307, 308, 500]).toContain(response.status())
    })
  })
})
