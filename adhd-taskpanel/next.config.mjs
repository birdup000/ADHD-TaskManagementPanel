/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode to catch hook-related issues
  // Core React configuration
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Optimization settings
  optimizeFonts: true,
  swcMinify: true,
  
  // Experimental features for React 18 and beyond
  experimental: {
    // Runtime optimizations
    optimizeCss: true,
    optimizeImages: true,
    scrollRestoration: true,
    
    // React optimizations
    strictModuleResolution: true,
    
    // Additional React 18 features
    enableUndici: true,
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/:path*.(css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/styles/preload-critical.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Link',
            value: '</styles/preload-critical.css>; rel=preload; as=style'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}

export default nextConfig;