import { test, expect } from '@playwright/test'

test.describe('Forgot password page', () => {
  test('is accessible to unauthenticated visitors', async ({ page }) => {
    await page.goto('/forgot-password')

    expect(page.url()).toContain('/forgot-password')
    await expect(
      page.getByRole('heading', { name: 'Forgot password' })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()
  })

  test('links back to login', async ({ page }) => {
    await page.goto('/forgot-password')

    const link = page.getByRole('link', { name: 'Sign in' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/login')
  })

  test('login page links to forgot password', async ({ page }) => {
    await page.goto('/login')

    const link = page.getByRole('link', { name: 'Forgot password?' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/forgot-password')
  })
})

test.describe('Reset password page', () => {
  test('redirects unauthenticated visitors to forgot-password', async ({ page }) => {
    await page.goto('/reset-password')

    await page.waitForURL('**/forgot-password')
    expect(page.url()).toContain('/forgot-password')
  })
})
