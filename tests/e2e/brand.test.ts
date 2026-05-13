import { test, expect } from '@playwright/test'

test.describe('/brand public page', () => {
  test('renders hero, sections and is publicly accessible', async ({ page }) => {
    const response = await page.goto('/brand')
    expect(response?.status()).toBe(200)

    await expect(page.getByRole('heading', { name: /Brand guidelines/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /^Logo$/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Color palette/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Typography/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /How we sound/i })).toBeVisible()
  })

  test('logo downloads point to existing files', async ({ page, request }) => {
    await page.goto('/brand')

    const cases = [
      { name: /SVG · White/i, file: 'tag-logo-white.svg' },
      { name: /SVG · Black/i, file: 'tag-logo-black.svg' },
      { name: /^PNG$/i, file: 'tag-logo.png' },
    ]

    for (const c of cases) {
      const link = page.getByRole('link', { name: c.name })
      await expect(link).toHaveAttribute('download', c.file)
      const href = await link.getAttribute('href')
      expect(href).toBeTruthy()
      const head = await request.head(href!)
      expect(head.status()).toBe(200)
    }
  })

  test('color swatch copies hex to clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium-only')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/brand')

    await page.getByRole('button', { name: /Copy #ff5f1f/i }).click()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied.toLowerCase()).toBe('#ff5f1f')
  })
})
