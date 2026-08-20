import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/pt', permanent: true }]
  },
  async rewrites() {
    // A pasta real é `pilares`; a URL inglesa é `pillars`. Ver src/lib/routes.ts.
    return [{ source: '/en/pillars/:pilar', destination: '/en/pilares/:pilar' }]
  },
}

export default nextConfig
