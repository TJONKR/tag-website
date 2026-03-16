import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
if (!RAPIDAPI_KEY) {
  console.error('❌ Missing RAPIDAPI_KEY in .env.local')
  process.exit(1)
}

const API_BASE = 'https://fresh-linkedin-profile-data.p.rapidapi.com/enrich-lead'
const API_HOST = 'fresh-linkedin-profile-data.p.rapidapi.com'

interface BuilderEntry {
  linkedinUrl: string
  name?: string
  headline?: string
  about?: string
  photoUrl?: string | null
  company?: string
  jobTitle?: string
  location?: string
  scrapedAt: string
  error?: string
}

const URLS_FILE = path.join(__dirname, 'builder-urls.txt')
const OUTPUT_FILE = path.join(__dirname, 'builders-data.json')
const DELAY_MS = 1_500 // 1.5s between API calls

function slugFromUrl(url: string): string {
  return url.replace(/\/$/, '').split('/').pop() ?? url
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchProfile(linkedinUrl: string): Promise<BuilderEntry> {
  const params = new URLSearchParams({
    linkedin_url: linkedinUrl,
    include_skills: 'false',
    include_certifications: 'false',
    include_publications: 'false',
    include_honors: 'false',
    include_volunteers: 'false',
    include_projects: 'false',
    include_patents: 'false',
    include_courses: 'false',
  })

  const res = await fetch(`${API_BASE}?${params}`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': API_HOST,
    },
  })

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }

  const json = await res.json()
  const data = json.data

  if (!data || !data.full_name) {
    throw new Error(json.message || 'No profile data returned')
  }

  return {
    linkedinUrl,
    name: data.full_name,
    headline: data.headline || '',
    about: data.about || '',
    photoUrl: data.profile_image_url || null,
    company: data.company || '',
    jobTitle: data.job_title || '',
    location: data.location || '',
    scrapedAt: new Date().toISOString(),
  }
}

async function main() {
  const raw = fs.readFileSync(URLS_FILE, 'utf-8')
  const urls = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  console.log(`\n🔍 Fetching ${urls.length} LinkedIn profiles via RapidAPI...\n`)

  const results: BuilderEntry[] = []
  let successCount = 0

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const slug = slugFromUrl(url)
    const pad = `[${i + 1}/${urls.length}]`

    try {
      const entry = await fetchProfile(url)
      results.push(entry)
      successCount++
      console.log(` ${pad} ${slug} → ✓ ${entry.name}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({
        linkedinUrl: url,
        scrapedAt: new Date().toISOString(),
        error: message,
      })
      console.log(` ${pad} ${slug} → ⚠️  ${message}`)
    }

    // Small delay between API calls
    if (i < urls.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2) + '\n')

  console.log(`\n✓ Fetched ${successCount}/${urls.length} profiles`)
  console.log(`📄 Saved to ${path.relative(process.cwd(), OUTPUT_FILE)}\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
