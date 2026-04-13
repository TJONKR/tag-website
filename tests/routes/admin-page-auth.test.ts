import { test, expect } from '@playwright/test'

test.describe('Admin claims page auth', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/portal/admin/claims')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('redirect')).toBe('/portal/admin/claims')
  })
})
