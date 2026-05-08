// Enrich externally-managed events by scraping the public Luma event page.
//
// Luma's API refuses event/get for events whose primary calendar isn't ours
// (returns 403). But the public page at luma.com/<slug> is server-rendered
// by Next.js and embeds the full event blob in a __NEXT_DATA__ script, with
// no auth required.

export interface ScrapedEvent {
  apiId: string
  name: string | null
  description: string | null // markdown
  coverUrl: string | null
  guestCount: number | null
  hosts: string[]
}

// Walk any JSON shape and return the first object that looks like a Luma event.
// Shape drifts between pages; keying off api_id is more stable than following
// a specific path in __NEXT_DATA__.
function findEventObject(node: unknown): Record<string, unknown> | null {
  const seen = new Set<unknown>()
  const stack: unknown[] = [node]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || typeof current !== 'object' || seen.has(current)) continue
    seen.add(current)
    if (Array.isArray(current)) {
      for (const child of current) stack.push(child)
      continue
    }
    const obj = current as Record<string, unknown>
    if (typeof obj.api_id === 'string' && obj.api_id.startsWith('evt-') && 'name' in obj) {
      return obj
    }
    for (const key of Object.keys(obj)) stack.push(obj[key])
  }
  return null
}

function extractNextData(html: string): unknown | null {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  )
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

export async function scrapePublicEvent(slug: string): Promise<ScrapedEvent | null> {
  const res = await fetch(`https://luma.com/${slug}`, {
    headers: {
      // Luma serves the SSR blob to plain GETs, but setting a UA makes
      // behaviour more predictable across environments.
      'User-Agent': 'Mozilla/5.0 (compatible; tag-website/1.0)',
      Accept: 'text/html',
    },
    redirect: 'follow',
  })
  if (!res.ok) return null
  const html = await res.text()

  const nextData = extractNextData(html)
  if (!nextData) return null

  const event = findEventObject(nextData)
  if (!event) return null

  const apiId = String(event.api_id)
  const name = typeof event.name === 'string' ? event.name : null

  const page = findPageProps(nextData)

  const description =
    (typeof event.description_md === 'string' ? event.description_md : null) ??
    (page && 'description_mirror' in page ? prosemirrorToText(page.description_mirror) : null)

  let coverUrl: string | null =
    typeof event.cover_url === 'string' ? event.cover_url : null
  if (!coverUrl && page) {
    const cover = page.cover_image
    if (isObject(cover) && typeof cover.url === 'string') coverUrl = cover.url
  }

  const guestCount =
    page && typeof page.guest_count === 'number' ? page.guest_count : null

  const hosts: string[] = []
  if (page && Array.isArray(page.hosts)) {
    for (const host of page.hosts) {
      if (isObject(host) && typeof host.name === 'string') hosts.push(host.name)
    }
  }

  return { apiId, name, description, coverUrl, guestCount, hosts }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Luma stores the event description as a ProseMirror doc. Flatten to plain text
// with paragraph breaks — good enough for previews and cards.
function prosemirrorToText(node: unknown): string | null {
  if (!node) return null
  const parts: string[] = []
  const walk = (n: unknown) => {
    if (!isObject(n)) return
    if (n.type === 'text' && typeof n.text === 'string') {
      parts.push(n.text)
      return
    }
    if (n.type === 'hard_break') {
      parts.push('\n')
      return
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child)
      if (n.type === 'paragraph') parts.push('\n\n')
    }
  }
  walk(node)
  const text = parts.join('').trim()
  return text.length > 0 ? text : null
}

// The Next.js page wraps event data in props.pageProps; walk to the object
// that contains both `event` and page-level fields like guest_count / hosts.
function findPageProps(node: unknown): Record<string, unknown> | null {
  const seen = new Set<unknown>()
  const stack: unknown[] = [node]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!isObject(current) || seen.has(current)) continue
    seen.add(current)
    if ('event' in current && ('guest_count' in current || 'hosts' in current)) {
      return current
    }
    for (const key of Object.keys(current)) stack.push(current[key])
  }
  return null
}
