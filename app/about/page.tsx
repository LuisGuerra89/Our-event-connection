import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"

export default async function AboutPage() {
  const supabase = await createServerClient()

  const { data: content } = await supabase
    .from("cms_content")
    .select("*")
    .eq("page_key", "about_us")
    .eq("status", "active")
    .single()

  return (
    <PublicPageLayout>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              {content?.title || "About Us"}
            </h1>
            {content?.subtitle && (
              <p className="text-xl md:text-2xl text-muted-foreground text-pretty">
                {content.subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Optional Banner Image */}
        {content?.banner_image && (
          <div className="absolute inset-0 -z-10 opacity-20">
            <img 
              src={content.banner_image} 
              alt="About Us Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </section>

      {/* Content Section with HTML Support */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: content?.content || "<p>About Us content will be available soon.</p>",
              }}
            />
          </article>
        </div>
      </section>

      {/* Optional Secondary Content Section */}
      {content?.secondary_content && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: content.secondary_content,
                }}
              />
            </article>
          </div>
        </section>
      )}
    </PublicPageLayout>
  )
}
