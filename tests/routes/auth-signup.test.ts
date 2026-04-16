import { test, expect } from '@playwright/test'

test.describe('Signup page', () => {
  test('is accessible to unauthenticated visitors', async ({ page }) => {
    await page.goto('/signup')

    expect(page.url()).toContain('/signup')
    await expect(
      page.getByRole('heading', { name: 'Set up your account' })
    ).toBeVisible()
  })

  test('links to login for existing accounts', async ({ page }) => {
    await page.goto('/signup')

    const link = page.getByRole('link', { name: 'Sign in' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/login')
  })
})
