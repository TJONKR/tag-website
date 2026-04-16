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

  test('/register redirects to /join (no public signup)', async ({ page }) => {
    await page.goto('/register')
    const url = new URL(page.url())

    expect(url.pathname).toBe('/join')
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')

    expect(page.url()).toContain('/login')
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })

  test('login page shows signup and apply CTAs', async ({ page }) => {
    await page.goto('/login')

    const setUp = page.getByRole('link', { name: 'Set up your account' })
    await expect(setUp).toBeVisible()
    await expect(setUp).toHaveAttribute('href', '/signup')

    const apply = page.getByRole('link', { name: 'Apply for membership' })
    await expect(apply).toBeVisible()
    await expect(apply).toHaveAttribute('href', '/join')
  })
})
