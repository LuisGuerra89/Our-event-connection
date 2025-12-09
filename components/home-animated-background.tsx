"use client"

import { useEffect, useRef } from "react"

export function HomeAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight * 2 // Double height for scroll
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Draw heart shape
    const drawHeart = (x: number, y: number, size: number, opacity: number) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = "rgba(236, 72, 153, 0.3)" // pink-500 with transparency

      ctx.beginPath()
      // Heart path
      ctx.moveTo(x, y + size * 0.35)
      ctx.bezierCurveTo(x, y + size * 0.35, x - size * 0.5, y - size * 0.1, x - size * 0.5, y - size * 0.25)
      ctx.bezierCurveTo(x - size * 0.5, y - size * 0.45, x - size * 0.2, y - size * 0.6, x, y - size * 0.4)
      ctx.bezierCurveTo(x + size * 0.2, y - size * 0.6, x + size * 0.5, y - size * 0.45, x + size * 0.5, y - size * 0.25)
      ctx.bezierCurveTo(x + size * 0.5, y - size * 0.1, x, y + size * 0.35, x, y + size * 0.35)
      ctx.fill()
      ctx.restore()
    }

    // Draw wavy lines
    const drawWavyLine = (
      startY: number,
      amplitude: number,
      frequency: number,
      color: string,
      opacity: number,
      lineWidth: number,
      xOffset: number = 0
    ) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 5) {
        const y = startY + Math.sin((x / canvas.width) * Math.PI * frequency) * amplitude
        const adjustedX = x + xOffset
        if (x === 0) {
          ctx.moveTo(adjustedX, y)
        } else {
          ctx.lineTo(adjustedX, y)
        }
      }
      ctx.stroke()
      ctx.restore()
    }

    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Get scroll position
      const scrollProgress = Math.min(window.scrollY / (window.innerHeight * 1.5), 1)

      // Draw background heart (builds progressively) - Position on the LEFT side
      const heartOpacity = scrollProgress * 0.3
      drawHeart(canvas.width * 0.15, canvas.height / 3, 400, heartOpacity)

      // Draw wavy divider lines at different heights - Position on the LEFT side
      const line1Y = canvas.height * 0.25 + Math.sin(scrollProgress * Math.PI * 3) * 40
      const line2Y = canvas.height * 0.5 + Math.sin(scrollProgress * Math.PI * 2.5 + 1) * 50
      const line3Y = canvas.height * 0.75 + Math.sin(scrollProgress * Math.PI * 3.2 + 2) * 45

      // Line 1 - Pink (on the left) - MOVES RIGHT
      drawWavyLine(
        line1Y,
        50 + scrollProgress * 40, // increased amplitude
        2 + scrollProgress * 2,
        `rgba(236, 72, 153, ${0.5 + scrollProgress * 0.3})`, // pink-500
        0.6 + scrollProgress * 0.2,
        3,
        canvas.width * 0.25 + scrollProgress * canvas.width * 0.3 // moves right with scroll
      )

      // Line 2 - Red (on the left) - MOVES LEFT
      drawWavyLine(
        line2Y,
        60 + scrollProgress * 50, // increased amplitude
        2.5 + scrollProgress * 1.5,
        `rgba(220, 38, 38, ${0.5 + scrollProgress * 0.3})`, // red-600
        0.5 + scrollProgress * 0.25,
        3,
        canvas.width * 0.2 - scrollProgress * canvas.width * 0.25 // moves left with scroll
      )

      // Line 3 - Pink (on the left) - MOVES RIGHT
      drawWavyLine(
        line3Y,
        55 + scrollProgress * 45, // increased amplitude
        2 + scrollProgress * 2,
        `rgba(236, 72, 153, ${0.5 + scrollProgress * 0.3})`, // pink-500
        0.55 + scrollProgress * 0.2,
        3,
        canvas.width * 0.25 + scrollProgress * canvas.width * 0.35 // moves right with scroll
      )

      // Draw more decorative hearts at different positions on the LEFT
      if (scrollProgress > 0.2) {
        drawHeart(canvas.width * 0.1, canvas.height * 0.4, 80, (scrollProgress - 0.2) * 0.4)
      }
      if (scrollProgress > 0.4) {
        drawHeart(canvas.width * 0.05, canvas.height * 0.6, 100, (scrollProgress - 0.4) * 0.35)
      }
      if (scrollProgress > 0.6) {
        drawHeart(canvas.width * 0.12, canvas.height * 0.8, 90, (scrollProgress - 0.6) * 0.3)
      }
      if (scrollProgress > 0.8) {
        drawHeart(canvas.width * 0.08, canvas.height * 1.2, 110, (scrollProgress - 0.8) * 0.35)
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full pointer-events-none"
      style={{
        height: "200vh",
        zIndex: 0,
      }}
    />
  )
}
