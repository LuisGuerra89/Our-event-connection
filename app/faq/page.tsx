import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{content?.title || "Frequently Asked Questions"}</h1>
          <p className="text-xl text-muted-foreground">Find answers to common questions about our platform</p>
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
      </div>
    </PublicPageLayout>
  )
}
