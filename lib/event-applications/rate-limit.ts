import { countRecentSubmissionsByIpHash } from './queries'

export const HOURLY_LIMIT = 3
export const DAILY_LIMIT = 10

/**
 * Derive a peppered SHA-256 hash of the request IP. Returns `null` when no
 * IP can be resolved (request came from an environment without the usual
 * proxy headers — e.g. local test runs). Missing pepper falls back to a
 * stable warning instead of throwing, so the app still boots if the env
 * var hasn't been set yet.
 */
export const hashIp = async (ip: string | null): Promise<string | null> => {
  if (!ip) return null

  const pepper = process.env.APP_IP_HASH_SECRET
  if (!pepper) {
    console.warn(
      '[event-applications] APP_IP_HASH_SECRET is unset — IP hashes are insecure'
    )
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(`${pepper ?? 'dev-pepper'}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Best-effort extraction of the client IP. `x-forwarded-for` is the standard
 * header set by most reverse proxies including Vercel.
 */
export const extractIp = (req: Request): string | null => {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return null
}

export interface RateLimitResult {
  allowed: boolean
  reason?: 'hourly' | 'daily'
}

export const checkRateLimit = async (ipHash: string | null): Promise<RateLimitResult> => {
  if (!ipHash) return { allowed: true }

  const now = Date.now()
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString()
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()

  const [hourly, daily] = await Promise.all([
    countRecentSubmissionsByIpHash(ipHash, oneHourAgo),
    countRecentSubmissionsByIpHash(ipHash, oneDayAgo),
  ])

  if (hourly >= HOURLY_LIMIT) return { allowed: false, reason: 'hourly' }
  if (daily >= DAILY_LIMIT) return { allowed: false, reason: 'daily' }

  return { allowed: true }
}
