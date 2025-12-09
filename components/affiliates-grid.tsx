"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Affiliate {
  id: string
  name: string
  image_url: string | null
}

interface AffiliatesGridProps {
  affiliates: Affiliate[]
}

export function AffiliatesGrid({ affiliates }: AffiliatesGridProps) {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Partners & Affiliates</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Trusted partners making your events extraordinary</p>
        </div>
        
        {/* Logo Grid - Clean and Professional */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center max-w-6xl mx-auto mb-16">
          {affiliates.map((affiliate) => (
            <Link
              key={affiliate.id}
              href={`/affiliates#${affiliate.id}`}
              className="group w-full h-24 flex items-center justify-center"
              title={affiliate.name}
            >
              {affiliate.image_url ? (
                <img
                  src={affiliate.image_url}
                  alt={affiliate.name}
                  className="h-20 max-w-[140px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              ) : (
                <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 text-center px-4 line-clamp-2">
                  {affiliate.name}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white font-semibold px-8">
            <Link href="/affiliates">View All Partners & Exclusive Benefits →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
