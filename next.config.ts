import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
