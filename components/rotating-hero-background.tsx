"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface RotatingHeroBackgroundProps {
  children: React.ReactNode
  images?: string[]
}

const DEFAULT_IMAGES = [
  "/slideshow/1.jpg",
  "/slideshow/2.jpg",
  "/slideshow/3.jpg",
  "/slideshow/4.jpg",
  "/slideshow/5.jpg",
  "/slideshow/6.jpg",
  "/slideshow/7.jpg",
  "/slideshow/8.jpg",
  "/slideshow/9.jpg",
  "/slideshow/10.jpg",
  "/slideshow/11.jpg",
  "/slideshow/12.jpg",
  "/slideshow/13.jpg",
  "/slideshow/14.jpg",
]

const ROTATION_INTERVAL = 8000 // 8 seconds

export function RotatingHeroBackground({ children, images = DEFAULT_IMAGES }: RotatingHeroBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
        setNextImageIndex((prev) => (prev + 1) % images.length)
        setIsTransitioning(false)
      }, 500)
    }, ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const currentImage = images[currentImageIndex]
  const nextImage = images[nextImageIndex]

  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32 overflow-hidden">
      {/* Current background image */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
        style={{
          backgroundImage: `url('${currentImage}')`,
        }}
      />

      {/* Next background image (preloaded for smooth transition) */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
          isTransitioning ? "opacity-100" : "opacity-0"
        )}
        style={{
          backgroundImage: `url('${nextImage}')`,
        }}
      />

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  )
}
