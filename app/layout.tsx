import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { CookieConsent } from '@/components/cookie-consent'
import { TrafficTracker } from '@/components/traffic-tracker'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ourloveconnection.com'),
  title: 'Our Love Connection - It all starts with one Event to find a perfect Match',
  description: 'It all starts with one Event to find a perfect Match. Meet meaningful connections through carefully curated social events at Our Love Connection.',
  keywords: 'dating events, singles networking, social events dating, meet singles, dating events near me, event-based dating, connections, find love',
  applicationName: 'Our Love Connection',
  authors: [{ name: 'Our Love Connection Team' }],
  creator: 'Our Love Connection',
  publisher: 'Our Love Connection',
  formatDetection: {
    email: true,
    telephone: true,
    address: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon.png', sizes: '256x256', type: 'image/png' },
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Our Love Connection - It all starts with one Event to find a perfect Match',
    description: 'It all starts with one Event to find a perfect Match. Meet meaningful connections through carefully curated social events',
    url: 'https://ourloveconnection.com',
    siteName: 'Our Love Connection',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Our Love Connection - It all starts with one Event to find a perfect Match',
        type: 'image/png',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Love Connection - Connect Through Shared Experiences',
    description: 'Meet meaningful connections through carefully curated social events',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: 'index, follow',
  },
  alternates: {
    canonical: 'https://ourloveconnection.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <link rel="canonical" href="https://ourloveconnection.com" />
        <link rel="alternate" hrefLang="en" href="https://ourloveconnection.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-D4QLGD09FV"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D4QLGD09FV');
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <TrafficTracker>
          {children}
        </TrafficTracker>
        <Analytics />
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  )
}
