import { test, expect } from '@playwright/test'

test.describe('FAL AI routes authentication', () => {
  test('POST /api/fal/images rejects unauthenticated request', async ({ request }) => {
    const response = await request.post('/api/fal/images', {
      data: { prompt: 'test', num_images: 1 },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  test('POST /api/fal/video rejects unauthenticated request', async ({ request }) => {
    const response = await request.post('/api/fal/video', {
      data: { prompt: 'test' },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  test('POST /api/fal/model-3d rejects unauthenticated request', async ({ request }) => {
    const response = await request.post('/api/fal/model-3d', {
      data: { prompt: 'test' },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })
})
