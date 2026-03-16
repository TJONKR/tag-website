#!/usr/bin/env tsx
import path from 'path'
import { input, select, confirm } from '@inquirer/prompts'
import { scrapeLinkedIn } from './lib/linkedin'
import { processHeadshot } from './lib/image'
import { appendBuilder } from './lib/update-data'

const PROJECT_ROOT = path.resolve(__dirname, '..')

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function extractRole(headline: string): string {
  // Try to extract role from "Title at Company" pattern
  const atMatch = headline.match(/^([^@|–—-]+?)(?:\s+at\s|\s*[@|–—]\s*)/i)
  if (atMatch) return atMatch[1].trim()
  // Fall back to first ~30 chars of headline
  return headline.slice(0, 30).trim()
}

async function main() {
  const linkedinUrl = process.argv[2]

  if (!linkedinUrl) {
    console.error('Usage: pnpm add-builder <linkedin-url>')
    console.error('Example: pnpm add-builder https://linkedin.com/in/username')
    process.exit(1)
  }

  let name = ''
  let headline = ''
  let photoBuffer: Buffer | null = null

  // --- Scrape LinkedIn ---
  console.log('\n🔍 Scraping LinkedIn profile...')
  try {
    const profile = await scrapeLinkedIn(linkedinUrl)
    name = profile.name
    headline = profile.headline
    photoBuffer = profile.photoBuffer

    if (photoBuffer) {
      console.log(`\n✓ Found: ${name} — ${headline}`)
    } else {
      console.log(`\n✓ Found: ${name} — ${headline} (no photo)`)
    }
  } catch (err) {
    console.warn(`\n⚠️  LinkedIn scraping failed: ${(err as Error).message}`)
    console.log('   Falling back to manual input.\n')
  }

  // --- Interactive confirmation / editing ---
  name = await input({
    message: 'Name:',
    default: name || undefined,
    validate: (v) => (v.trim() ? true : 'Name is required'),
  })

  const suggestedRole = headline ? extractRole(headline) : ''
  const role = await input({
    message: 'Role:',
    default: suggestedRole || undefined,
    validate: (v) => (v.trim() ? true : 'Role is required'),
  })

  const team = await select({
    message: 'Team:',
    choices: [
      { name: 'Core team', value: 'coreBuilders' as const },
      { name: 'Community', value: 'communityBuilders' as const },
    ],
  })

  const active = await confirm({ message: 'Active builder?', default: true })

  let imagePath: string | null = null

  if (photoBuffer) {
    const processPhoto = await confirm({
      message: `Process headshot?`,
      default: true,
    })

    if (processPhoto) {
      console.log('\n🖼  Processing headshot...')
      const slug = toSlug(name)
      imagePath = await processHeadshot(photoBuffer, slug, PROJECT_ROOT)
      console.log(`✓ Saved to public/images/builders/${slug}.jpg`)
    }
  } else {
    console.log('\n⚠️  No photo found. You can add one manually to public/images/builders/ later.')
  }

  // --- Update data.ts ---
  console.log('\n📝 Updating lib/builders/data.ts...')

  const slug = toSlug(name)

  // Warn on slug collision
  const { builders } = await import('../lib/builders/data')
  if (builders.some((b) => b.slug === slug)) {
    console.warn(`⚠️  Slug "${slug}" already exists in data.ts — inserting anyway.`)
  }

  appendBuilder(name, role, active, imagePath, team)

  console.log(`✓ ${slug} added!\n`)
  console.log(`   Profile: /builders/${slug}`)
  console.log(`   Run \`pnpm build\` to deploy.\n`)
}

main().catch((err) => {
  if (err?.name === 'ExitPromptError') {
    // User pressed Ctrl+C
    console.log('\nAborted.')
    process.exit(0)
  }
  console.error('\n❌ Error:', err)
  process.exit(1)
})
