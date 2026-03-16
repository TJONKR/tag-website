import fs from 'fs'
import path from 'path'

const ORIGINALS_DIR = path.join(__dirname, 'tmp', 'originals')
const OUTPUT_BASE = path.join(__dirname, 'tmp', 'styles')
const DATA_FILE = path.join(__dirname, 'builders-data.json')

const FAL_KEY = process.env.FAL_KEY
if (!FAL_KEY) {
  console.error('❌ Missing FAL_KEY env var')
  process.exit(1)
}

const STYLES = {
  illustration: `Transform this portrait into a stylized digital illustration. Clean vector-art style with bold flat colors, subtle cel-shading, and minimal detail. Use a limited palette of deep black, charcoal gray, and warm orange (#ff5f1f) as the accent color. Dark background. The person should be clearly recognizable but feel like a premium tech company avatar illustration. Think Notion-style team illustrations but edgier and more high-contrast.`,
  comicbook: `Transform this photo into a bold graphic novel / comic book style portrait. Heavy black ink outlines, dramatic shadows, high contrast cel-shading. Limited color palette: mostly black and dark charcoal with vivid orange (#ff5f1f) as the only accent color for highlights and rim lighting. Dark moody background. Keep the person's likeness and features recognizable. The style should feel like a page from a premium graphic novel — Sin City meets modern tech branding. Do not add any text or watermarks.`,
  screenprint: `Transform this portrait into a retro screen-print / risograph style artwork. Halftone dot patterns, limited ink layers, slight misregistration between color layers for that authentic printed feel. Use only two ink colors: deep black and bright orange (#ff5f1f) on a dark charcoal background. High contrast, grainy texture, vintage poster aesthetic. The person should be clearly recognizable. Think classic screen-printed band poster or Shepard Fairey-style portrait. Do not add any text or watermarks.`,
}

interface BuilderData {
  linkedinUrl: string
  name?: string
  photoUrl?: string | null
  error?: string
}

function slugFromName(name: string): string {
  const clean = name.split('//')[0].trim()
  return clean
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

async function uploadToFal(filePath: string): Promise<string> {
  const fileData = fs.readFileSync(filePath)
  const blob = new Blob([fileData], { type: 'image/jpeg' })
  const formData = new FormData()
  formData.append('file', blob, path.basename(filePath))

  const res = await fetch('https://fal.ai/api/upload', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}` },
    body: formData,
  })

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json()
  return data.file_url
}

interface QueuedJob {
  name: string
  slug: string
  style: string
  requestId: string
  responseUrl: string
}

async function submitJob(
  imageUrl: string,
  prompt: string,
): Promise<{ requestId: string; responseUrl: string }> {
  const res = await fetch(
    'https://queue.fal.run/fal-ai/gemini-3.1-flash-image-preview/edit',
    {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_urls: [imageUrl],
        aspect_ratio: '3:4',
        resolution: '1K',
        output_format: 'jpeg',
        seed: 42,
      }),
    },
  )

  if (!res.ok) throw new Error(`Submit failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return { requestId: data.request_id, responseUrl: data.response_url }
}

async function pollResult(responseUrl: string, maxWaitMs = 120_000): Promise<string> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 3000))
    const res = await fetch(responseUrl, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    })
    if (res.status === 200) {
      const data = await res.json()
      if (data.images?.[0]?.url) return data.images[0].url
    }
    // Still in progress, keep polling
  }
  throw new Error('Timeout waiting for result')
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buffer)
}

async function main() {
  // Create output dirs
  for (const style of Object.keys(STYLES)) {
    fs.mkdirSync(path.join(OUTPUT_BASE, style), { recursive: true })
  }

  // Load builder data
  const builders: BuilderData[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  const withPhotos = builders.filter((b) => b.name && b.photoUrl && !b.error)

  const styleEntries = Object.entries(STYLES)
  const total = withPhotos.length * styleEntries.length
  console.log(`\n🎨 Stylizing ${withPhotos.length} photos × ${styleEntries.length} styles = ${total} images\n`)

  // Step 1: Upload all originals
  console.log('📤 Uploading originals to fal.ai...')
  const uploads: Map<string, string> = new Map()

  for (const builder of withPhotos) {
    const slug = slugFromName(builder.name!)
    const originalPath = path.join(ORIGINALS_DIR, `${slug}.jpg`)
    if (!fs.existsSync(originalPath)) {
      console.log(`   ⚠️  Missing original for ${builder.name}, skipping`)
      continue
    }
    try {
      const url = await uploadToFal(originalPath)
      uploads.set(slug, url)
      console.log(`   ✓ ${builder.name}`)
    } catch (err) {
      console.log(`   ⚠️  ${builder.name}: ${err}`)
    }
  }

  // Step 2: Submit all jobs (batch of 6 at a time to avoid overload)
  console.log(`\n🚀 Submitting ${uploads.size * styleEntries.length} generation jobs...\n`)
  const allJobs: QueuedJob[] = []

  for (const [slug, imageUrl] of uploads) {
    const builder = withPhotos.find((b) => slugFromName(b.name!) === slug)!
    for (const [style, prompt] of styleEntries) {
      const outputPath = path.join(OUTPUT_BASE, style, `${slug}.jpg`)
      if (fs.existsSync(outputPath)) {
        console.log(` ⏭  ${builder.name} [${style}] — already exists`)
        continue
      }
      try {
        const { requestId, responseUrl } = await submitJob(imageUrl, prompt)
        allJobs.push({ name: builder.name!, slug, style, requestId, responseUrl })
        console.log(` 📨 ${builder.name} [${style}]`)
        // Small delay between submissions
        await new Promise((r) => setTimeout(r, 500))
      } catch (err) {
        console.log(` ⚠️  ${builder.name} [${style}]: ${err}`)
      }
    }
  }

  // Step 3: Poll for all results
  console.log(`\n⏳ Waiting for ${allJobs.length} results...\n`)
  let done = 0

  // Process in batches of 6
  for (let i = 0; i < allJobs.length; i += 6) {
    const batch = allJobs.slice(i, i + 6)
    const results = await Promise.allSettled(
      batch.map(async (job) => {
        const imageUrl = await pollResult(job.responseUrl)
        const outputPath = path.join(OUTPUT_BASE, job.style, `${job.slug}.jpg`)
        await downloadFile(imageUrl, outputPath)
        done++
        console.log(` ✓ [${done}/${allJobs.length}] ${job.name} [${job.style}]`)
      }),
    )

    for (let j = 0; j < results.length; j++) {
      if (results[j].status === 'rejected') {
        done++
        console.log(` ⚠️  [${done}/${allJobs.length}] ${batch[j].name} [${batch[j].style}]: ${(results[j] as PromiseRejectedResult).reason}`)
      }
    }
  }

  console.log(`\n✓ Done! Results saved to:`)
  for (const style of Object.keys(STYLES)) {
    const count = fs.readdirSync(path.join(OUTPUT_BASE, style)).length
    console.log(`  📁 scripts/tmp/styles/${style}/ (${count} images)`)
  }
  console.log()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
