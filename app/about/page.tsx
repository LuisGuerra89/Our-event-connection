import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, Target, Lightbulb, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default async function AboutPage() {
  const supabase = await createServerClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  const { data: content } = await supabase
    .from("cms_content")
    .select("*")
    .eq("page_key", "about_us")
    .eq("status", "active")
    .single()

  const missionItems = [
    {
      icon: Heart,
      title: "Connection",
      description: "Building meaningful connections between people who share interests and values"
    },
    {
      icon: Users,
      title: "Community",
      description: "Creating inclusive spaces where everyone feels welcome and valued"
    },
    {
      icon: Target,
      title: "Purpose",
      description: "Facilitating events that bring people together and create lasting memories"
    }
  ]

  const valuesItems = [
    {
      icon: Shield,
      title: "Safety & Trust",
      description: "We prioritize the safety and security of our members in every interaction"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously improve to provide the best experience for our community"
    },
    {
      icon: Lightbulb,
      title: "Authenticity",
      description: "We encourage genuine connections through authentic interactions and events"
    }
  ]

  return (
    <PublicPageLayout>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-primary/8 via-primary/4 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              {content?.title || "About Our Love Connection"}
            </h1>
            {content?.subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed">
                {content.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {content?.content && (
              <article className="prose prose-base dark:prose-invert max-w-none mb-6 leading-relaxed [&>div]:space-y-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.content,
                  }}
                />
              </article>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">OUR MISSION</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Building Connections</h2>
              <p className="text-base text-muted-foreground">
                We're dedicated to bringing people together through shared experiences
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {missionItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-3">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-rose-50/50 to-transparent dark:from-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">OUR VALUES</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Core Principles</h2>
              <p className="text-base text-muted-foreground">
                Guiding principles that shape everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {valuesItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-3">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Content if available */}
      {content?.secondary_content && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <article className="prose prose-lg dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.secondary_content,
                  }}
                />
              </article>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show if not authenticated */}
      {!user && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Connect?</h2>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Join our community and discover meaningful connections through shared experiences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/events">Explore Events</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </PublicPageLayout>
  )
}
