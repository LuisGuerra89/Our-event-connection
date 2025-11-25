import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Our Event Connection - Connect Through Shared Experiences',
  description: 'Meet meaningful connections through carefully curated social events. Our Event Connection brings singles together for unforgettable experiences.',
  keywords: 'dating, events, singles, networking, social events, connections',
  applicationName: 'Our Event Connection',
  authors: [{ name: 'Our Event Connection Team' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Our Event Connection - Connect Through Shared Experiences',
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
      </body>
    </html>
  )
}
