/**
 * Canonical production origin. Used for metadata, sitemap, robots and JSON-LD so
 * every absolute URL we emit points at the same host (www, https, no trailing slash).
 */
export const SITE_URL = 'https://www.tag.space';

/**
 * Google Search Console verification token (URL-prefix property for SITE_URL).
 * Rendered as a <meta name="google-site-verification"> tag. Not secret — it is
 * public in the page HTML. Can be overridden via the GOOGLE_SITE_VERIFICATION env var.
 */
export const GOOGLE_SITE_VERIFICATION = 'Mo2PjyYvsITjrPvPAbxS12QJ6K9V0QGtxrSMMsFFrhg';
