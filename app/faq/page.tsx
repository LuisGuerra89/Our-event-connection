import type { Metadata } from 'next'
import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Script from 'next/script'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ | Frequently Asked Questions | Our Love Connection',
  description: 'Find answers to commonly asked questions about Our Love Connection, membership, events, dating, and more.',
  keywords: 'FAQ, frequently asked questions, help center, customer support, dating questions, event information',
  openGraph: {
    title: 'FAQ | Frequently Asked Questions | Our Love Connection',
    description: 'Find answers to commonly asked questions about Our Love Connection.',
    url: 'https://ourloveconnection.com/faq',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Frequently Asked Questions | Our Love Connection',
    description: 'Find answers to commonly asked questions about Our Love Connection.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://ourloveconnection.com/faq',
  },
}

export default async function FAQPage() {
  const supabase = await createServerClient()

  const { data: content } = await supabase
    .from("cms_content")
    .select("*")
    .eq("page_key", "faq")
    .eq("status", "active")
    .single()

  // Parse FAQ content - expecting JSON format with questions/answers or HTML
  let faqItems = []
  let htmlContent = ""
  
  try {
    if (content?.content) {
      // Try to parse as JSON first
      faqItems = JSON.parse(content.content)
    }
  } catch (e) {
    // If not JSON, treat as HTML/text content
    htmlContent = content?.content || ""
  }

  return (
    <PublicPageLayout>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((faq: { question: string; answer: string }) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{content?.title || "Frequently Asked Questions - Get Answers About Our Love Connection"}</h1>
          <p className="text-xl text-muted-foreground">Find comprehensive answers to common questions about our platform, events, and membership</p>
        </div>

        {htmlContent && (
          <article className="prose prose-lg dark:prose-invert mx-auto mb-8">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </article>
        )}

        {faqItems.length > 0 && (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((faq: { question: string; answer: string }, index: number) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Internal Linking Section */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-8 text-center">Ready to Get Started?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-6 w-6 text-rose-600 mb-2" />
                <CardTitle>Try Matchmaking</CardTitle>
                <CardDescription>Discover compatible matches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/matchmaking">Start Matching →</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle>Browse Events</CardTitle>
                <CardDescription>Meet singles in person</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/events">View Events →</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <HelpCircle className="h-6 w-6 text-purple-600 mb-2" />
                <CardTitle>Pricing Plans</CardTitle>
                <CardDescription>See membership options</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/pricing">View Pricing →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  )
}
