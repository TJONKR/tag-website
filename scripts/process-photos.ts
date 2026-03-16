import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const INPUT_DIR = path.join(__dirname, 'tmp', 'originals')
const OUTPUT_DIR = path.join(__dirname, 'tmp', 'processed')
const DATA_FILE = path.join(__dirname, 'builders-data.json')

// TAG brand colors
const TAG_ORANGE = { r: 255, g: 95, b: 31 }
const TAG_DARK = { r: 20, g: 18, b: 16 }

// Output dimensions (3:4 portrait for the grid cards)
const OUTPUT_WIDTH = 600
const OUTPUT_HEIGHT = 800

interface BuilderData {
  linkedinUrl: string
  name?: string
  photoUrl?: string | null
  error?: string
}

function slugFromName(name: string): string {
  // Strip everything after // (LinkedIn name decorations)
  const clean = name.split('//')[0].trim()
  return clean
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

async function downloadPhoto(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buffer)
}

/**
 * Apply TAG brand filter:
 * 1. Crop to 3:4 portrait (center on face / upper portion)
 * 2. Desaturate heavily
 * 3. Boost contrast
 * 4. Apply warm orange tint via duotone
 * 5. Add vignette
 */
async function applyFilter(inputPath: string, outputPath: string): Promise<void> {
  const metadata = await sharp(inputPath).metadata()
  const w = metadata.width!
  const h = metadata.height!

  // Step 1: Smart crop to 3:4 portrait
  // For square LinkedIn photos (800x800), we take full width and crop height
  // For wider photos, crop to center
  const targetRatio = 3 / 4
  const currentRatio = w / h

  let cropWidth = w
  let cropHeight = h
  let cropLeft = 0
  let cropTop = 0

  if (currentRatio > targetRatio) {
    // Wider than needed — crop sides
    cropWidth = Math.round(h * targetRatio)
    cropLeft = Math.round((w - cropWidth) / 2)
  } else {
    // Taller than needed or exact — crop bottom (keep top/face)
    cropHeight = Math.round(w / targetRatio)
    // Bias toward top of image where face usually is
    cropTop = Math.round((h - cropHeight) * 0.15)
  }

  // Step 2-5: Process the image
  await sharp(inputPath)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: Math.min(cropHeight, h - cropTop),
    })
    .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: 'cover', position: 'top' })
    // Heavy desaturation (keep just a hint of color)
    .modulate({ saturation: 0.15 })
    // Boost contrast via linear adjustment
    .linear(1.4, -(128 * 1.4 - 128))
    // Orange tint overlay
    .tint(TAG_ORANGE)
    // Slight gamma for mood
    .gamma(1.8)
    .jpeg({ quality: 85 })
    .toFile(outputPath)
}

async function main() {
  // Create directories
  fs.mkdirSync(INPUT_DIR, { recursive: true })
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Load scraped data
  const builders: BuilderData[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  const withPhotos = builders.filter((b) => b.name && b.photoUrl && !b.error)

  console.log(`\n📸 Processing ${withPhotos.length} builder photos...\n`)

  for (let i = 0; i < withPhotos.length; i++) {
    const builder = withPhotos[i]
    const slug = slugFromName(builder.name!)
    const pad = `[${i + 1}/${withPhotos.length}]`
    const originalPath = path.join(INPUT_DIR, `${slug}.jpg`)
    const processedPath = path.join(OUTPUT_DIR, `${slug}.jpg`)

    try {
      // Download original
      if (!fs.existsSync(originalPath)) {
        await downloadPhoto(builder.photoUrl!, originalPath)
      }

      // Apply filter
      await applyFilter(originalPath, processedPath)

      console.log(` ${pad} ${builder.name} → ✓`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(` ${pad} ${builder.name} → ⚠️  ${msg}`)
    }
  }

  console.log(`\n✓ Processed photos saved to scripts/tmp/processed/`)
  console.log(`  Review them, then run the copy step to move to public/images/builders/\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
