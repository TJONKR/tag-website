import { test, expect } from '@playwright/test'

test.describe('Taste portal page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/portal/taste')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/login')
  })
})
