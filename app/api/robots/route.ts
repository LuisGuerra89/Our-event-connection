import { MetadataRoute } from 'next'
import { NextResponse } from 'next/server'

export function GET(): NextResponse<MetadataRoute.Robots> {
  const robots = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/debug-*', '/_next/', '/private/'],
    },
    sitemap: ['https://ourloveconnection.com/sitemap.xml'],
  }

  const text = `# robots.txt for Our Love Connection

# Allow all bots
User-agent: *
Allow: /

# Disallow private areas
Disallow: /admin/
Disallow: /api/
Disallow: /debug-*
Disallow: /_next/
Disallow: /private/

# Specific rules for Google
User-agent: Googlebot
Allow: /

# Specific rules for Bing
User-agent: Bingbot
Allow: /

# Crawl delay (in seconds)
Crawl-delay: 1

# Sitemap location
Sitemap: https://ourloveconnection.com/sitemap.xml`

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
