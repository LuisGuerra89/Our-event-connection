import { PublicPageLayout } from "@/components/public-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { 
  Eye, 
  Ear, 
  MousePointer, 
  Keyboard, 
  Monitor, 
  MessageSquare,
  Accessibility,
  CheckCircle,
  Mail
} from "lucide-react"

export const metadata = {
  title: "Accessibility - Our Love Connection",
  description: "Our commitment to digital accessibility. Learn about our efforts to make Our Love Connection accessible to everyone.",
}

const accessibilityFeatures = [
  {
    icon: <Keyboard className="h-6 w-6" />,
    title: "Keyboard Navigation",
    description: "Our website can be fully navigated using only a keyboard. Use Tab to move between elements, Enter to activate links and buttons, and Escape to close modals."
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Screen Reader Support",
    description: "We use semantic HTML and ARIA labels to ensure our content is accessible to screen readers like NVDA, JAWS, and VoiceOver."
  },
  {
    icon: <Monitor className="h-6 w-6" />,
    title: "Responsive Design",
    description: "Our website adapts to different screen sizes and zoom levels, ensuring content remains accessible on any device."
  },
  {
    icon: <MousePointer className="h-6 w-6" />,
    title: "Focus Indicators",
    description: "Clear visual focus indicators help users understand which element is currently selected when navigating with a keyboard."
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Color Contrast",
    description: "We maintain sufficient color contrast ratios throughout our website to ensure text is readable for users with visual impairments."
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Alternative Text",
    description: "Images include descriptive alternative text to convey information to users who cannot see them."
  },
]

const wcagGuidelines = [
  {
    principle: "Perceivable",
    description: "Information and user interface components must be presentable to users in ways they can perceive.",
    items: [
      "Text alternatives for non-text content",
      "Captions and alternatives for multimedia",
      "Content adaptable to different presentations",
      "Distinguishable content with sufficient contrast"
    ]
  },
  {
    principle: "Operable",
    description: "User interface components and navigation must be operable.",
    items: [
      "All functionality available via keyboard",
      "Sufficient time to read and use content",
      "Content that doesn't cause seizures",
      "Navigable with multiple ways to find pages"
    ]
  },
  {
    principle: "Understandable",
    description: "Information and the operation of user interface must be understandable.",
    items: [
      "Readable and understandable text",
      "Predictable web page operation",
      "Input assistance to avoid and correct mistakes"
    ]
  },
  {
    principle: "Robust",
    description: "Content must be robust enough to be interpreted by a wide variety of user agents.",
    items: [
      "Compatible with current and future tools",
      "Valid and well-structured markup",
      "Accessible name and role for all components"
    ]
  }
]

export default function AccessibilityPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Accessibility className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We are committed to ensuring digital accessibility for people of all abilities. 
            We continually improve the user experience for everyone.
          </p>
        </div>

        {/* Our Commitment */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Commitment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                At Our Love Connection, we believe that everyone deserves the opportunity to connect 
                with others and find meaningful relationships. We are committed to providing a website 
                that is accessible to the widest possible audience, regardless of technology or ability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA 
                standards. These guidelines explain how to make web content more accessible for people 
                with disabilities and more user-friendly for everyone.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Accessibility Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Accessibility Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accessibilityFeatures.map((feature, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* WCAG Guidelines */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">WCAG 2.1 Guidelines</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            We follow the four main principles of WCAG to ensure our website is accessible:
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {wcagGuidelines.map((guideline, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{guideline.principle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{guideline.description}</p>
                  <ul className="space-y-2">
                    {guideline.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Assistive Technologies */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Assistive Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our website is designed to be compatible with the following assistive technologies:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Screen Readers</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• NVDA (Windows)</li>
                    <li>• JAWS (Windows)</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Browsers</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Google Chrome</li>
                    <li>• Mozilla Firefox</li>
                    <li>• Apple Safari</li>
                    <li>• Microsoft Edge</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Known Issues */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Ongoing Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We are continuously working to improve the accessibility of our website. 
                We regularly review our site using automated testing tools and manual testing 
                with assistive technologies. If you encounter any accessibility barriers, 
                please let us know so we can address them promptly.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Feedback */}
        <section className="mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Feedback & Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We welcome your feedback on the accessibility of Our Love Connection. 
                If you encounter any accessibility barriers or have suggestions for improvement, 
                please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:accessibility@ourloveconnection.com" className="text-primary hover:underline">
                    accessibility@ourloveconnection.com
                  </a>
                </p>
                <p>
                  <strong>Contact Form:</strong>{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    Visit our contact page
                  </Link>
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We try to respond to accessibility feedback within 2 business days.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This accessibility statement was last updated on December 2, 2025.</p>
        </div>
      </div>
    </PublicPageLayout>
  )
}
