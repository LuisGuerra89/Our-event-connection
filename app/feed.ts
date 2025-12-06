import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/debug-*', '/_next/', '/private/'],
    },
    sitemap: ['https://ourloveconnection.com/sitemap.xml', 'https://ourloveconnection.com/sitemap-0.xml'],
  }
}
