import path from 'path'
import sharp from 'sharp'

// Combined color matrix that:
// 1. Converts to grayscale (L = 0.299R + 0.587G + 0.114B)
// 2. Darkens by 60% (keep 60%)
// 3. Applies orange tint (#ff5f1f at 40% multiply)
//
// Orange components: R=1.0, G=0.373, B=0.122
// multiply blend at 40%: out = base * (1 - 0.4) + base * tint * 0.4
//
// R_out = L * 0.6 * (1 + 0.4*(1.0-1))   = L * 0.6        → [0.1794, 0.3522, 0.0684]
// G_out = L * 0.6 * (1 + 0.4*(0.373-1)) = L * 0.4494     → [0.1344, 0.2638, 0.0512]
// B_out = L * 0.6 * (1 + 0.4*(0.122-1)) = L * 0.3893     → [0.1164, 0.2285, 0.0443]
const RECOMB_MATRIX: sharp.Matrix3x3 = [
  [0.1794, 0.3522, 0.0684],
  [0.1344, 0.2638, 0.0512],
  [0.1164, 0.2285, 0.0443],
]

const OUTPUT_WIDTH = 400
const OUTPUT_HEIGHT = 533

export async function processHeadshot(
  imageBuffer: Buffer,
  slug: string,
  projectRoot: string
): Promise<string> {
  const outputPath = path.join(projectRoot, 'public', 'images', 'builders', `${slug}.jpg`)

  await sharp(imageBuffer)
    .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, {
      fit: 'cover',
      position: 'top',
    })
    .recomb(RECOMB_MATRIX)
    .jpeg({ quality: 90 })
    .toFile(outputPath)

  return `/images/builders/${slug}.jpg`
}
