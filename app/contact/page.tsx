import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { PublicPageLayout } from "@/components/public-page-layout"
import { ContactFormClient } from "@/components/contact-form-client"
import { use } from "react"

export default function ContactPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = use(searchParams)
  
  return (
    <PublicPageLayout>
      {/* Hero Banner */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat py-20 md:py-32"
        style={{
          backgroundImage: `url('/contact-us.jpg')`
        }}
      >
        {/* Overlays for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Contact Us
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Have questions or suggestions? We'd love to hear from you. Our team is here to help!
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-6xl">

        {/* Main Form Section */}
        <Card className="max-w-3xl mx-auto border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription className="text-muted-foreground">Fill out the form below and we'll get back to you shortly</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ContactFormClient error={params.error} />
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-16 bg-muted/50 rounded-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Why Contact Us?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">✓</span>
              <span><strong>General Inquiries:</strong> Ask any questions about Our Love Connection</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">✓</span>
              <span><strong>Event Suggestions:</strong> Suggest new event ideas you'd like to see</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">✓</span>
              <span><strong>Support:</strong> Get help with your account or technical issues</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">✓</span>
              <span><strong>Feedback:</strong> Share your experience and suggestions to improve our platform</span>
            </li>
          </ul>
        </div>
      </div>
    </PublicPageLayout>
  )
}
