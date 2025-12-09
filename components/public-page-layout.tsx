import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <PublicHeader />
      <main className="flex-1 pt-24 md:pt-28">{children}</main>
      <Footer />
    </div>
  )
}
