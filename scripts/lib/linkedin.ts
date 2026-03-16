import path from 'path'
import os from 'os'
import { chromium } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'

export const USER_DATA_DIR = path.join(os.homedir(), '.config', 'tag-builder', 'linkedin-user-data')
const LOGIN_URL = 'https://www.linkedin.com/login'
const LOGIN_TIMEOUT_MS = 120_000 // 2 min for manual login

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Simulate human-like browsing — small scroll, mouse wiggle, short pause */
async function humanBrowse(page: Page): Promise<void> {
  // Random small scroll down (like reading the page)
  await page.mouse.wheel(0, randomBetween(100, 400))
  await sleep(randomBetween(300, 800))

  // Move mouse to a random spot on the page
  await page.mouse.move(randomBetween(200, 900), randomBetween(200, 500))
  await sleep(randomBetween(200, 600))

  // Scroll back up a little
  await page.mouse.wheel(0, randomBetween(-150, -50))
  await sleep(randomBetween(400, 1000))
}

export interface LinkedInProfile {
  name: string
  headline: string
  photoUrl: string | null
  photoBuffer: Buffer | null
}

const HEADLINE_SELECTORS = [
  '.text-body-medium.break-words',
  '[data-generated-suggestion-target]',
  '.pv-text-details__left-panel .text-body-medium',
  'div.ph5 .text-body-medium',
]

const PHOTO_SELECTORS = [
  'img.pv-top-card-profile-picture__image--show',
  '.profile-photo-edit__preview',
  'img[class*="profile-photo"]',
  'img[class*="profile_image"]',
  'button[aria-label*="profile photo"] img',
  '.pv-top-card__photo-wrapper img',
]

async function promptLogin(page: Page, profileUrl: string): Promise<void> {
  console.log('\n🔐 LinkedIn login required.')
  console.log('   Please log in to LinkedIn in the browser window that opened.')
  console.log('   The script will continue automatically once you are logged in.\n')

  // Navigate to login page so the user can enter credentials
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 })

  // Wait until URL no longer contains /login (user completed login)
  await page.waitForURL((url: URL) => !url.toString().includes('/login'), {
    timeout: LOGIN_TIMEOUT_MS,
  })

  // Navigate back to the original profile
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
}

/**
 * Scrape a LinkedIn profile using an already-open browser context and page.
 * Does NOT download the photo — returns the URL only.
 */
export async function scrapeLinkedInWithContext(
  page: Page,
  context: BrowserContext,
  profileUrl: string,
): Promise<LinkedInProfile> {
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })

  // Detect login redirect (URL-based)
  if (page.url().includes('/login') || page.url().includes('/checkpoint')) {
    await promptLogin(page, profileUrl)
  }

  // Wait for the main profile content
  await page.waitForSelector('h1', { timeout: 15_000 })

  // Simulate reading the page like a human
  await humanBrowse(page)

  // Extract name
  let name = await page.$eval('h1', (el: Element) => el.textContent?.trim() ?? '')

  // Detect auth wall — LinkedIn shows "Join LinkedIn" as h1 for unauthenticated visitors
  if (!name || name.toLowerCase().includes('join linkedin')) {
    await promptLogin(page, profileUrl)
    await page.waitForSelector('h1', { timeout: 15_000 })
    await humanBrowse(page)
    name = await page.$eval('h1', (el: Element) => el.textContent?.trim() ?? '')
  }

  if (!name) throw new Error('Could not extract name from LinkedIn profile')

  // Extract headline (try multiple selectors)
  let headline = ''
  for (const selector of HEADLINE_SELECTORS) {
    try {
      const text = await page.$eval(selector, (el: Element) => el.textContent?.trim() ?? '')
      if (text) {
        headline = text
        break
      }
    } catch {
      // try next selector
    }
  }

  // Extract photo URL (try multiple selectors)
  let photoUrl: string | null = null
  for (const selector of PHOTO_SELECTORS) {
    try {
      const src = await page.$eval(selector, (el: Element) => (el as HTMLImageElement).src ?? '')
      if (src && !src.includes('data:')) {
        photoUrl = src
        break
      }
    } catch {
      // try next selector
    }
  }

  return { name, headline, photoUrl, photoBuffer: null }
}

/**
 * Scrape a single LinkedIn profile (launches its own browser context).
 * Downloads the photo bytes. Backwards-compatible wrapper.
 */
export async function scrapeLinkedIn(profileUrl: string): Promise<LinkedInProfile> {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 },
  })

  const page = await context.newPage()

  try {
    const profile = await scrapeLinkedInWithContext(page, context, profileUrl)

    // Download photo using the authenticated session
    if (profile.photoUrl) {
      try {
        const response = await context.request.get(profile.photoUrl)
        if (response.ok()) {
          profile.photoBuffer = Buffer.from(await response.body())
        }
      } catch {
        console.warn('⚠️  Could not download photo, skipping.')
      }
    }

    return profile
  } finally {
    await context.close()
  }
}
