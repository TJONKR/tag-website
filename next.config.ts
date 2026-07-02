import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the workspace root to this checkout so Next does not walk up and pick a
  // sibling lockfile (git worktrees live inside the parent repo, which has its own).
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'media.licdn.com',
      },
      {
        hostname: 'cjvpeuxpwwwvxpjptslz.supabase.co',
      },
      {
        hostname: 'fal.media',
      },
      {
        hostname: 'v3.fal.media',
      },
    ],
  },
};

export default nextConfig;
