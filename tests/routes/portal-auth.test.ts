import { test, expect } from '@playwright/test'

test.describe('Portal authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    const response = await page.goto('/portal')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('redirect')).toBe('/portal')
  })

  test('redirects to login for nested portal routes', async ({ page }) => {
    await page.goto('/portal/events')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('redirect')).toBe('/portal/events')
  })

  test('register page is not accessible', async ({ page }) => {
    const response = await page.goto('/register')

    expect(response?.status()).toBe(404)
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')

    expect(page.url()).toContain('/login')
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })

  test('login page does not have register link', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('link', { name: 'Sign up' })).not.toBeVisible()
  })
})
