import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
