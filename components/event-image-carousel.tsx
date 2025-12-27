"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"

interface EventImageCarouselProps {
  images: string[]
  title: string
  eventType?: string
}

export function EventImageCarousel({ images, title, eventType }: EventImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    
    // Get scroll progress to determine current slide
    const scrollSnaps = emblaApi.scrollSnapList()
    const scrollProgress = emblaApi.scrollProgress()
    const index = Math.round(scrollProgress * (scrollSnaps.length - 1))
    
    setCurrentIndex(Math.max(0, index))
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const handlePrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev()
    }
  }

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext()
    }
  }

  const handleDotClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index)
    }
  }

  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center overflow-hidden rounded-lg">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No images available</p>
        </div>
      </div>
    )
  }

  // Si solo hay una imagen, mostrarla sin carousel
  if (images.length === 1) {
    return (
      <div className="aspect-video relative bg-gray-100 overflow-hidden rounded-lg">
        <Image
          src={images[0]}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
        />
      </div>
    )
  }

  // Carousel con múltiples imágenes
  return (
    <div className="relative group">
      {/* Carousel Container */}
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className="aspect-video relative bg-gray-100 overflow-hidden">
                <Image
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Left */}
      <button
        onClick={handlePrev}
        disabled={!canScrollPrev}
        aria-label="Previous image"
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 z-20",
          "h-10 w-10 rounded-full bg-black/50 text-white",
          "flex items-center justify-center transition-all duration-200",
          "hover:bg-black/70 active:scale-95",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/50",
          "opacity-0 group-hover:opacity-100"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Navigation Buttons - Right */}
      <button
        onClick={handleNext}
        disabled={!canScrollNext}
        aria-label="Next image"
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 z-20",
          "h-10 w-10 rounded-full bg-black/50 text-white",
          "flex items-center justify-center transition-all duration-200",
          "hover:bg-black/70 active:scale-95",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/50",
          "opacity-0 group-hover:opacity-100"
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Gradient Overlay - Top */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none rounded-t-lg" />

      {/* Image Counter Badge */}
      <div className="absolute top-4 right-4 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Event Type Badge - if provided */}
      {eventType && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize backdrop-blur-sm">
            {eventType.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to image ${index + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
