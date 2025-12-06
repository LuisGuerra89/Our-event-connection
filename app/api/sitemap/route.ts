import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // Revalidate every hour

export async function GET(): Promise<NextResponse<MetadataRoute.Sitemap>> {
  const baseUrl = 'https://ourloveconnection.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/matchmaking`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/membership`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Dynamic event pages
  try {
    const supabase = await createClient()
    const { data: events } = await supabase
      .from('events')
      .select('id, updated_at')
      .gte('end_date', new Date().toISOString())
      .limit(1000)

    const eventPages = (events || []).map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const sitemap = [...staticPages, ...eventPages]
    
    // Return as XML
    const xml = generateSiteMapXml(sitemap)
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
    const xml = generateSiteMapXml(staticPages)
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

function generateSiteMapXml(sitemap: any[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemap
    .map(
      (item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified.toISOString().split('T')[0]}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>
  `
    )
    .join('')}
</urlset>`
  return xml
}
