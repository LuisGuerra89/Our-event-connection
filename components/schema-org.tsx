import { ReactNode } from 'react'

interface SchemaOrgProps {
  data: Record<string, any>
}

export function SchemaOrg({ data }: SchemaOrgProps): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
      suppressHydrationWarning
    />
  )
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Our Love Connection',
  url: 'https://ourloveconnection.com',
  logo: 'https://ourloveconnection.com/logo.png',
  description:
    'Meet meaningful connections through carefully curated social events. Our Love Connection brings singles together for unforgettable experiences.',
  sameAs: [
    'https://www.facebook.com/oureventconnection/',
    'https://www.instagram.com/ourloveconnection',
    'https://www.twitter.com/ourloveconnection',
  ],
  contact: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@ourloveconnection.com',
    availableLanguage: 'en',
  },
}

export const eventSchema = (event: {
  name: string
  description?: string
  startDate: string
  endDate?: string
  location?: { name?: string; address?: string }
  image?: string
  url?: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.name,
  description: event.description || '',
  startDate: event.startDate,
  endDate: event.endDate || event.startDate,
  image: event.image || 'https://ourloveconnection.com/og-image.png',
  url: event.url || 'https://ourloveconnection.com/events',
  location: {
    '@type': 'Place',
    name: event.location?.name || 'Our Love Connection',
    address: event.location?.address || '',
  },
  organizer: {
    '@type': 'Organization',
    name: 'Our Love Connection',
    url: 'https://ourloveconnection.com',
  },
})

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

export const faqSchema = (
  faqs: Array<{
    question: string
    answer: string
  }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})
