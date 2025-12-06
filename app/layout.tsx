import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { CookieConsent } from '@/components/cookie-consent'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Our Love Connection - Connect Through Shared Experiences',
  description: 'Meet meaningful connections through carefully curated social events. Our Love Connection brings singles together for unforgettable experiences.',
  keywords: 'dating, events, singles, networking, social events, connections',
  applicationName: 'Our Love Connection',
  authors: [{ name: 'Our Love Connection Team' }],
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Our Love Connection - Connect Through Shared Experiences',
    description: 'Meet meaningful connections through carefully curated social events',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  )
}
