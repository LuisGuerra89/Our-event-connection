import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"

export default async function TermsPage() {
  const supabase = await createServerClient()

  const { data: content } = await supabase
    .from("cms_content")
    .select("*")
    .eq("page_key", "terms_conditions")
    .eq("status", "active")
    .single()

  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <article className="prose prose-lg dark:prose-invert mx-auto">
          <h1 className="text-4xl font-bold mb-8">{content?.title || "Terms of Service"}</h1>
          <div
            dangerouslySetInnerHTML={{
              __html: content?.content || "<p>Terms of Service content will be available soon.</p>",
            }}
          />
        </article>
      </div>
    </PublicPageLayout>
  )
}
