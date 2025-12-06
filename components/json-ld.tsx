import { ReactNode } from 'react'

/**
 * Componente reutilizable para agregar JSON-LD Schema.org
 * Úsalo en cualquier página para mejorar SEO
 */

interface JsonLdProps {
  data: Record<string, any>
  id?: string
}

export function JsonLd({ data, id = 'json-ld' }: JsonLdProps): ReactNode {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
      suppressHydrationWarning
    />
  )
}

/**
 * Schema predefinidos listos para usar
 */

export const schemas = {
  // Búsqueda local
  localBusiness: (data: {
    name: string
    address: string
    phone?: string
    email?: string
    latitude?: number
    longitude?: number
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address,
    },
    telephone: data.phone,
    email: data.email,
    geo: data.latitude && data.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: data.latitude,
      longitude: data.longitude,
    } : undefined,
  }),

  // Reviews/Testimonios
  review: (data: {
    author: string
    reviewRating: number
    reviewBody: string
    datePublished: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: data.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: data.reviewBody,
    datePublished: data.datePublished,
  }),

  // Agregado de reviews
  aggregateRating: (data: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: data.ratingValue,
    reviewCount: data.reviewCount,
    bestRating: data.bestRating || 5,
    worstRating: data.worstRating || 1,
  }),

  // Producto/Servicio
  product: (data: {
    name: string
    description?: string
    image?: string
    price?: number
    currency?: string
    availability?: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: data.image,
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency || 'USD',
      availability: `https://schema.org/${data.availability || 'InStock'}`,
    },
  }),

  // Artículo de blog
  article: (data: {
    headline: string
    description?: string
    image?: string
    datePublished: string
    dateModified?: string
    author: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.headline,
    description: data.description,
    image: data.image,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: data.author,
    },
  }),

  // Video
  video: (data: {
    name: string
    description?: string
    thumbnailUrl?: string
    uploadDate: string
    duration?: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.name,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    uploadDate: data.uploadDate,
    duration: data.duration,
  }),
}
