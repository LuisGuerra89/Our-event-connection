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

const ROTATION_INTERVAL = 8000 // 8 seconds

export function RotatingHeroBackground({ children, images = DEFAULT_IMAGES }: RotatingHeroBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextLoaded, setNextLoaded] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextIndex = (currentIndex + 1) % images.length
  const currentImage = images[currentIndex]
  const nextImage = images[nextIndex]

  // Reset nextLoaded when the target image changes
  useEffect(() => {
    setNextLoaded(false)
  }, [nextIndex])

  // Timer for minimum display duration
  useEffect(() => {
    setMinTimeElapsed(false)
    const timer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, 6000) // 6 seconds minimum display time
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Trigger transition when both constraints are met
  useEffect(() => {
    if (minTimeElapsed && nextLoaded && !isTransitioning) {
      setIsTransitioning(true)

      const transitionTimer = setTimeout(() => {
        setCurrentIndex(nextIndex)
        setIsTransitioning(false)
      }, 1000) // Match CSS duration

      return () => clearTimeout(transitionTimer)
    }
  }, [minTimeElapsed, nextLoaded, isTransitioning, nextIndex])

  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32 overflow-hidden">
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
            quality={60}
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
            quality={60}
            unoptimized
            onLoadingComplete={() => setNextLoaded(true)}
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
