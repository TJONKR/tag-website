/**
 * Generate previews of all skin styles applied to a single photo.
 * Batches requests to avoid rate limits, writes an HTML comparison page.
 *
 * Usage:
 *   pnpm tsx scripts/preview-skins.ts
 */
import fs from 'fs'
import path from 'path'

import { config as loadEnv } from 'dotenv'
import { fal } from '@fal-ai/client'

import { GLOBAL_STYLES, type SkinStyle } from './lib/skin-styles'

loadEnv({ path: path.join(__dirname, '..', '.env.local') })

const FAL_KEY = process.env.FAL_KEY
if (!FAL_KEY) {
  console.error('Missing FAL_KEY env var')
  process.exit(1)
}

fal.config({ credentials: FAL_KEY })

const BATCH_SIZE = 6
const TIJS_PHOTO_PATH = path.join(__dirname, 'tmp', 'originals', 'tijs-nieuwboer.jpg')

interface Result {
  style: SkinStyle
  url?: string
  error?: string
  durationMs: number
}

async function uploadLocalPhoto(filePath: string): Promise<string> {
  const buf = fs.readFileSync(filePath)
  const blob = new Blob([buf], { type: 'image/jpeg' })
  const file = new File([blob], path.basename(filePath), { type: 'image/jpeg' })
  return fal.storage.upload(file)
}

async function generateStyle(photoUrl: string, style: SkinStyle): Promise<Result> {
  const start = Date.now()
  console.log(`[${style.name}] submitting...`)
  try {
    const result = await fal.subscribe('fal-ai/gemini-3.1-flash-image-preview/edit', {
      input: {
        prompt: style.prompt,
        image_urls: [photoUrl],
        aspect_ratio: '3:4',
        resolution: '1K',
        output_format: 'jpeg',
        seed: Math.floor(Math.random() * 10000),
      },
      logs: false,
      pollInterval: 3000,
    })

    const url = (result.data as { images?: { url: string }[] })?.images?.[0]?.url
    if (!url) throw new Error('no image URL in response')

    const durationMs = Date.now() - start
    console.log(`[${style.name}] done in ${(durationMs / 1000).toFixed(1)}s`)
    return { style, url, durationMs }
  } catch (err) {
    const durationMs = Date.now() - start
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[${style.name}] failed: ${message}`)
    return { style, error: message, durationMs }
  }
}

function rarityColor(rarity: SkinStyle['rarity']): string {
  if (rarity === 'epic') return '#a855f7'
  if (rarity === 'rare') return '#fbbf24'
  return '#ff5f1f'
}

function buildHtml(photoUrl: string, results: Result[]): string {
  const byRarity = {
    common: results.filter((r) => r.style.rarity === 'common'),
    rare: results.filter((r) => r.style.rarity === 'rare'),
    epic: results.filter((r) => r.style.rarity === 'epic'),
  }

  const section = (title: string, items: Result[]) => {
    if (!items.length) return ''
    const cards = items
      .map((r) => {
        const color = rarityColor(r.style.rarity)
        const body = r.url
          ? `<img src="${r.url}" alt="${r.style.name}" />`
          : `<div class="error">Failed: ${r.error}</div>`
        return `
          <div class="card" style="border-color: ${color}">
            <div class="label">
              <span class="name">${r.style.name}</span>
              <span class="rarity" style="color: ${color}">${r.style.rarity}</span>
            </div>
            ${body}
            <div class="meta">${(r.durationMs / 1000).toFixed(1)}s</div>
          </div>`
      })
      .join('\n')
    return `
      <h2>${title} <span class="count">(${items.length})</span></h2>
      <div class="grid">${cards}</div>`
  }

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Skin Preview — All Styles</title>
  <style>
    body { background: #0a0a0a; color: #f5f5f5; font-family: -apple-system, sans-serif; margin: 0; padding: 32px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    h2 { font-size: 16px; margin: 40px 0 16px; text-transform: uppercase; letter-spacing: 2px; color: #aaa; }
    h2 .count { color: #555; font-weight: 400; }
    .sub { color: #888; margin-bottom: 24px; font-size: 13px; }
    .source { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding: 16px; border: 1px solid #222; border-radius: 12px; }
    .source img { width: 120px; height: 160px; object-fit: cover; border-radius: 8px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    @media (max-width: 1200px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    .card { border: 2px solid; border-radius: 14px; overflow: hidden; background: #111; }
    .card img { display: block; width: 100%; aspect-ratio: 3/4; object-fit: cover; }
    .label { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #222; }
    .name { font-weight: 600; font-size: 14px; }
    .rarity { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; }
    .meta { padding: 8px 14px; color: #666; font-size: 11px; font-family: monospace; }
    .error { padding: 40px; color: #ef4444; text-align: center; font-family: monospace; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Skin preview — all ${results.length} styles</h1>
  <div class="sub">Generated ${new Date().toLocaleString()}</div>
  <div class="source">
    <img src="${photoUrl}" alt="source" />
    <div>
      <div style="font-weight: 600; margin-bottom: 4px;">Source photo</div>
      <div style="color: #888; font-size: 13px;">Tijs Nieuwboer</div>
    </div>
  </div>
  ${section('Epic', byRarity.epic)}
  ${section('Rare', byRarity.rare)}
  ${section('Common', byRarity.common)}
</body>
</html>`
}

async function main() {
  console.log(`Uploading source photo to fal...`)
  const photoUrl = await uploadLocalPhoto(TIJS_PHOTO_PATH)
  console.log(`Uploaded: ${photoUrl.slice(0, 60)}...\n`)

  console.log(`Generating ${GLOBAL_STYLES.length} styles in batches of ${BATCH_SIZE}...\n`)
  const start = Date.now()

  const results: Result[] = []
  for (let i = 0; i < GLOBAL_STYLES.length; i += BATCH_SIZE) {
    const batch = GLOBAL_STYLES.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(GLOBAL_STYLES.length / BATCH_SIZE)
    console.log(`\n── Batch ${batchNum}/${totalBatches} (${batch.length} styles) ──`)
    const batchResults = await Promise.all(batch.map((s) => generateStyle(photoUrl, s)))
    results.push(...batchResults)
  }

  const total = ((Date.now() - start) / 1000).toFixed(1)
  const successes = results.filter((r) => r.url).length
  console.log(`\nDone: ${successes}/${results.length} succeeded in ${total}s\n`)

  const outDir = path.join(__dirname, 'output')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'skin-preview.html')
  fs.writeFileSync(outPath, buildHtml(photoUrl, results))

  console.log(`Wrote ${outPath}`)
  console.log(`Open with: open ${outPath}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
