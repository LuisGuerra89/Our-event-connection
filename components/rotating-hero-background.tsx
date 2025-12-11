"use client"

import Image from "next/image"
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

const ROTATION_INTERVAL = 8000 // 30 seconds

export function RotatingHeroBackground({ children, images = DEFAULT_IMAGES }: RotatingHeroBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Derived state for the next image
  const nextImageIndex = (currentImageIndex + 1) % images.length

  useEffect(() => {
    // Start timer for the next transition
    const timer = setTimeout(() => {
      triggerTransition()
    }, ROTATION_INTERVAL)

    return () => clearTimeout(timer)
  }, [currentImageIndex, images.length]) // Re-run when index changes (resets timer)

  const triggerTransition = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
      setIsTransitioning(false)
    }, 1000)
  }

  const handleManualNext = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button, a, input, textarea, [role='button']")) {
      return
    }

    triggerTransition()
  }

  const currentImage = images[currentImageIndex]
  const nextImage = images[nextImageIndex]

  return (
    <section
      className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32 overflow-hidden cursor-pointer"
      onClick={handleManualNext}
    >
      {/* Background container */}
      <div className="absolute inset-0 z-0">
        {/* Current Image (Bottom Layer) */}
        <div className="absolute inset-0">
          <Image
            src={currentImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Next Image (Top Layer) - Fades in */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            isTransitioning ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={nextImage}
            alt="Hero background next"
            fill
            className="object-cover"
            priority // Preload the next image
            unoptimized
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  )
}
