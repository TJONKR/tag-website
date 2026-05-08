import { test, expect } from '@playwright/test'

test.describe('/host-event public form', () => {
  test('renders hero and form', async ({ page }) => {
    await page.goto('/host-event')
    await expect(page.getByRole('heading', { name: /BRING YOUR EVENT/i })).toBeVisible()
    await expect(page.getByLabel(/Your name/i)).toBeVisible()
    await expect(page.getByLabel(/Event title/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Send request/i })).toBeVisible()
  })

  test('shows HTML required validation on empty submit', async ({ page }) => {
    await page.goto('/host-event')
    const nameField = page.getByLabel(/Your name/i)
    // Native HTML5 required kicks in before the fetch; assert field is invalid.
    await page.getByRole('button', { name: /Send request/i }).click()
    await expect(nameField).toHaveJSProperty('validity.valid', false)
  })

  test('fills form and sees success state', async ({ page }) => {
    await page.goto('/host-event')

    await page.getByLabel(/Your name/i).fill('Test Host E2E')
    await page
      .getByLabel(/Email/i)
      .first()
      .fill(`e2e-${Date.now()}@example.com`)
    await page.getByLabel(/Event title/i).fill('E2E Playwright Meetup')

    // Radix Select: click trigger, then option.
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Meetup' }).click()

    await page
      .getByLabel(/What's the event about/i)
      .fill('This is a detailed description about the event that is definitely long enough to pass validation.')

    // Wait out the 3-second anti-bot timing check.
    await page.waitForTimeout(3500)

    await page.getByRole('button', { name: /Send request/i }).click()

    // Either the success state appears (happy path), or a form-level error
    // shows up (e.g., backend misconfigured in test env). We assert the
    // form actually attempted submit by waiting for either outcome.
    const success = page.getByRole('heading', { name: /Request received/i })
    await expect(success).toBeVisible({ timeout: 10_000 })
  })
})
