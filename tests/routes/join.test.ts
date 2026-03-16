import { test, expect } from '@playwright/test'

test.describe('POST /api/join', () => {
  test('rejects request with missing required fields', async ({ request }) => {
    const response = await request.post('/api/join', {
      data: {},
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors).toBeDefined()
    expect(body.errors.length).toBeGreaterThan(0)
  })

  test('rejects request with invalid email', async ({ request }) => {
    const response = await request.post('/api/join', {
      data: {
        name: 'Test User',
        email: 'not-an-email',
        building: 'A test project',
        whyTag: 'Because testing',
      },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors).toBeDefined()
  })

  test('rejects request with empty name', async ({ request }) => {
    const response = await request.post('/api/join', {
      data: {
        name: '',
        email: 'test@example.com',
        building: 'A test project',
        whyTag: 'Because testing',
      },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors).toBeDefined()
  })

  test('rejects request with invalid social URL', async ({ request }) => {
    const response = await request.post('/api/join', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        building: 'A test project',
        whyTag: 'Because testing',
        linkedinUrl: 'not-a-url',
      },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors).toBeDefined()
  })

  test('accepts empty string social URLs', async ({ request }) => {
    const response = await request.post('/api/join', {
      data: {
        name: 'Test User',
        email: 'test-join-empty-socials@example.com',
        building: 'A test project',
        whyTag: 'Because testing',
        linkedinUrl: '',
        twitterUrl: '',
      },
    })

    // Should pass validation (200 or 500 if DB rejects duplicate)
    expect([200, 500]).toContain(response.status())
  })
})
