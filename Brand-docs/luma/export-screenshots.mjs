import { chromium } from '@playwright/test'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 2 })

await page.goto(`file://${path.join(__dirname, 'tag-luma-final.html')}`)
await page.waitForTimeout(1000)

// Logo: 400x400
const logo = page.locator('div[style*="width: 400px"]')
await logo.screenshot({ path: path.join(__dirname, 'tag-logo.png') })
console.log('Exported: tag-logo.png (800x800 @2x)')

// Header: 1750x500 (3.5:1 ratio)
const header = page.locator('div[style*="width: 1750px"]')
await header.screenshot({ path: path.join(__dirname, 'tag-header.png') })
console.log('Exported: tag-header.png (3500x1000 @2x)')

await browser.close()
console.log('Done!')
