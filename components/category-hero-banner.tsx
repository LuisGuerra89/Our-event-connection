"use client"

import { getCategoryBackgroundImage } from "@/lib/category-images"
import { cn } from "@/lib/utils"

interface CategoryHeroBannerProps {
  categorySlug: string
  title: string
  description: string
}

export function CategoryHeroBanner({ categorySlug, title, description }: CategoryHeroBannerProps) {
  const backgroundImage = getCategoryBackgroundImage(categorySlug)

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden bg-muted/30">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Multiple overlay layers for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 opacity-50" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg text-balance">
            {title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-md text-pretty max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
