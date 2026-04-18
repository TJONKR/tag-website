import { test, expect } from '@playwright/test'

test.describe('Portal profile + taste routes', () => {
  test('/portal/taste unauthenticated redirects to login', async ({ page }) => {
    await page.goto('/portal/taste')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('redirect')).toBe('/portal/taste')
  })

  test('/portal/profile unauthenticated redirects to login', async ({ page }) => {
    await page.goto('/portal/profile')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('redirect')).toBe('/portal/profile')
  })

  test('/portal/profile?tab=identity unauthenticated preserves redirect target', async ({
    page,
  }) => {
    await page.goto('/portal/profile?tab=identity')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/login')
    // redirect query string carries the original path
    const redirectParam = url.searchParams.get('redirect')
    expect(redirectParam).toContain('/portal/profile')
  })
})
