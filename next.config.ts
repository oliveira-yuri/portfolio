import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/pt', permanent: true }]
  },
}

export default nextConfig
