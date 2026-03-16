export interface ScreenshotImage {
  source: string
  base64: string
  mediaType: string
}

export interface StatusData {
  tweetCount?: number
  linkedinPostCount?: number
  dataSources?: string[]
  screenshotsCaptured?: number
}

export interface VerifiedData {
  name: string
  confidence: number
  excludedSources: string[]
  twitter: {
    verified: boolean
    handle: string
    displayName?: string
    bio?: string
    followers?: number
    following?: number
    originalTweets: string[]
    retweets: string[]
    quoteTweets: string[]
    notableTweets: string[]
  } | null
  linkedin: {
    verified: boolean
    headline?: string
    summary?: string
    experience?: string[]
    posts: string[]
  } | null
  website: {
    verified: boolean
    content: string
  } | null
  selfDescription: string | null
  webResearch: {
    url: string
    title: string
    relevance: string
    keyInsight: string
  }[]
  researcherNotes: string
}

export interface FormattedProfile {
  headline: string
  bio: string
  tags: string[]
  projects: { name: string; description: string; url?: string; role?: string }[]
  interests: string[]
  notable_work: string[]
  influences: string[]
  key_links: { url: string; title: string; type: string }[]
}
