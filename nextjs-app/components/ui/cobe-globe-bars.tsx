"use client"

import React, { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

export interface BarMarker {
  id: string
  location: [number, number]
  value: number
  label: string
  isHQ?: boolean
}

export interface GlobeArc {
  from: [number, number]
  to: [number, number]
}

export interface GlobeBarsProps {
  markers?: BarMarker[]
  arcs?: GlobeArc[]
  className?: string
  speed?: number
  dark?: number
  baseColor?: [number, number, number]
  markerColor?: [number, number, number]
  glowColor?: [number, number, number]
  arcColor?: [number, number, number]
}

export const defaultMarkers: BarMarker[] = [
  { id: "hq-bue", location: [-34.6037, -58.3816], value: 100, label: "HQ / BUENOS AIRES", isHQ: true },
  { id: "bar-nyc", location: [40.7128, -74.0060], value: 92, label: "NEW YORK" },
  { id: "bar-mad", location: [40.4168, -3.7038], value: 88, label: "MADRID" },
  { id: "bar-lon", location: [51.5074, -0.1278], value: 85, label: "LONDON" },
  { id: "bar-tok", location: [35.6762, 139.6503], value: 78, label: "TOKYO" },
  { id: "bar-mia", location: [25.7617, -80.1918], value: 95, label: "MIAMI" },
  { id: "bar-sao", location: [-23.5505, -46.6333], value: 90, label: "SÃO PAULO" },
  { id: "bar-scl", location: [-33.4489, -70.6693], value: 86, label: "SANTIAGO" },
]

export const defaultArcs: GlobeArc[] = [
  { from: [-34.6037, -58.3816], to: [40.7128, -74.0060] },
  { from: [-34.6037, -58.3816], to: [40.4168, -3.7038] },
  { from: [-34.6037, -58.3816], to: [51.5074, -0.1278] },
  { from: [-34.6037, -58.3816], to: [35.6762, 139.6503] },
  { from: [-34.6037, -58.3816], to: [25.7617, -80.1918] },
  { from: [-34.6037, -58.3816], to: [-23.5505, -46.6333] },
  { from: [-34.6037, -58.3816], to: [-33.4489, -70.6693] },
]

export function GlobeBars({
  markers = defaultMarkers,
  arcs = defaultArcs,
  className = "",
  speed = 0.003,
  dark = 1,
  baseColor = [0.15, 0.15, 0.18],
  markerColor = [0, 0.4, 0.8], // Action Blue #0066cc
  glowColor = [0.12, 0.25, 0.45],
  arcColor = [0.16, 0.59, 1.0],
}: GlobeBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      try {
        globe = createGlobe(canvas, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width,
          height: width,
          phi: 0,
          theta: -0.3,
          dark: dark,
          diffuse: 1.4,
          mapSamples: 16000,
          mapBrightness: 8,
          baseColor: baseColor,
          markerColor: markerColor,
          glowColor: glowColor,
          markerElevation: 0,
          markers: markers.map((m) => ({
            location: m.location,
            size: m.isHQ ? 0.05 : 0.03,
            id: m.id,
          })),
          arcs: arcs.map((a) => ({ from: a.from, to: a.to })),
          arcColor: arcColor,
          arcWidth: 0.6,
          arcHeight: 0.35,
          opacity: 0.85,
        })
      } catch (err) {
        console.error("Globe initialization error:", err)
      }

      function animate() {
        if (!isPausedRef.current) phi += speed
        if (globe) {
          globe.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: -0.3 + thetaOffsetRef.current + dragOffset.current.theta,
          })
        }
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"), 50)
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs, speed, dark, baseColor, markerColor, glowColor, arcColor])

  return (
    <div className={`relative aspect-square select-none max-w-full ${className}`}>
      <style>{`
        @keyframes bar-fill { from { width: 0; } to { width: var(--value, 0%); } }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            // @ts-expect-error CSS Anchor Positioning
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "0.2rem",
            padding: "0.35rem 0.5rem",
            background: "rgba(23, 23, 27, 0.9)",
            backdropFilter: "blur(12px)",
            border: m.isHQ ? "1.5px solid #0066cc" : "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 6,
            minWidth: 70,
            pointerEvents: "none" as const,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {m.isHQ && (
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#2997ff",
                  boxShadow: "0 0 8px #2997ff",
                }}
              />
            )}
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                color: m.isHQ ? "#2997ff" : "#d2d2d7",
              }}
            >
              {m.label}
            </span>
          </div>
          <span
            style={{
              width: "100%",
              height: 4,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${m.value}%`,
                background: m.isHQ ? "#2997ff" : "#0066cc",
                borderRadius: 2,
                animation: "bar-fill 1s ease-out forwards",
                // @ts-expect-error CSS custom property
                "--value": `${m.value}%`,
              }}
            />
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {m.isHQ ? "ORIGIN (HQ)" : `${m.value}% ACT`}
          </span>
        </div>
      ))}
    </div>
  )
}
