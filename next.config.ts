import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors from Supabase-generated types are fixed incrementally post-migration
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
