"use client"

import React, { useState } from "react"
import { GlobeBars, BarMarker, GlobeArc } from "@/components/ui/cobe-globe-bars"
import { 
  Globe, 
  MapPin, 
  Plane, 
  ShieldCheck, 
  Clock, 
  Compass, 
  ArrowUpRight, 
  Sparkles,
  PackageCheck
} from "lucide-react"

interface ShippingHub {
  id: string
  city: string
  country: string
  code: string
  region: string
  transitTime: string
  status: string
  location: [number, number]
  isHQ?: boolean
  volume: number
}

const SHIPPING_HUBS: ShippingHub[] = [
  {
    id: "hq-bue",
    city: "Buenos Aires",
    country: "Argentina",
    code: "BUE",
    region: "Central Atelier & Global HQ",
    transitTime: "Despacho Inmediato",
    status: "CENTRO DE OPERACIONES",
    location: [-34.6037, -58.3816],
    isHQ: true,
    volume: 100,
  },
  {
    id: "hub-mia",
    city: "Miami",
    country: "Estados Unidos",
    code: "MIA",
    region: "North America Gateway",
    transitTime: "24 — 48 Horas",
    status: "Ruta Express Activa",
    location: [25.7617, -80.1918],
    volume: 95,
  },
  {
    id: "hub-nyc",
    city: "Nueva York",
    country: "Estados Unidos",
    code: "NYC",
    region: "East Coast Hub",
    transitTime: "48 — 72 Horas",
    status: "Ruta Express Activa",
    location: [40.7128, -74.0060],
    volume: 92,
  },
  {
    id: "hub-mad",
    city: "Madrid",
    country: "España",
    code: "MAD",
    region: "Europe Central Gateway",
    transitTime: "48 — 72 Horas",
    status: "Ruta Express Activa",
    location: [40.4168, -3.7038],
    volume: 88,
  },
  {
    id: "hub-lon",
    city: "Londres",
    country: "Reino Unido",
    code: "LON",
    region: "UK Direct Line",
    transitTime: "48 — 72 Horas",
    status: "Ruta Express Activa",
    location: [51.5074, -0.1278],
    volume: 85,
  },
  {
    id: "hub-sao",
    city: "São Paulo",
    country: "Brasil",
    code: "GRU",
    region: "LatAm South Hub",
    transitTime: "24 — 48 Horas",
    status: "Ruta Directa Activa",
    location: [-23.5505, -46.6333],
    volume: 90,
  },
  {
    id: "hub-scl",
    city: "Santiago",
    country: "Chile",
    code: "SCL",
    region: "LatAm Andes Line",
    transitTime: "24 — 48 Horas",
    status: "Ruta Directa Activa",
    location: [-33.4489, -70.6693],
    volume: 86,
  },
  {
    id: "hub-tok",
    city: "Tokio",
    country: "Japón",
    code: "TYO",
    region: "Asia Pacific Line",
    transitTime: "3 — 5 Días Hábiles",
    status: "Ruta Express Activa",
    location: [35.6762, 139.6503],
    volume: 78,
  },
]

const GLOBE_MARKERS: BarMarker[] = SHIPPING_HUBS.map((hub) => ({
  id: hub.id,
  location: hub.location,
  value: hub.volume,
  label: hub.code,
  isHQ: hub.isHQ,
}))

const GLOBE_ARCS: GlobeArc[] = SHIPPING_HUBS.filter((h) => !h.isHQ).map((hub) => ({
  from: [-34.6037, -58.3816],
  to: hub.location,
}))

export function ShippingGlobeSection() {
  const [selectedHub, setSelectedHub] = useState<ShippingHub>(SHIPPING_HUBS[0])

  return (
    <section className="relative w-full bg-[#131316] text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-white/[0.08] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0066cc]/[0.08] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#272729] border border-white/[0.12] text-xs font-mono tracking-widest text-[#2997ff] uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#2997ff] animate-pulse" />
            Red Logística Global • Live Dispatch
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white max-w-3xl leading-[1.1]">
            Desde Buenos Aires hacia el mundo.
          </h2>

          <p className="mt-4 text-[17px] leading-[1.47] text-[#a1a1a6] max-w-2xl">
            Cada prenda de <strong className="text-white font-medium">DOPAMINE</strong> es confeccionada y despachada desde nuestro atelier principal en Buenos Aires con cobertura express y seguimiento satelital a más de 180 destinos globales.
          </p>
        </div>

        {/* Main 2-Column Grid: 3D Globe + Hubs & Logistics Intel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive 3D Globe */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center p-2 rounded-2xl bg-[#1c1c20]/50 border border-white/[0.06] backdrop-blur-sm">
              <GlobeBars
                markers={GLOBE_MARKERS}
                arcs={GLOBE_ARCS}
                speed={0.0025}
                dark={1}
                baseColor={[0.16, 0.16, 0.2]}
                markerColor={[0.0, 0.45, 0.95]}
                glowColor={[0.08, 0.22, 0.45]}
                arcColor={[0.16, 0.59, 1.0]}
                className="w-full h-full"
              />

              {/* Floating Live Indicator Badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-md text-[11px] font-mono text-white/90">
                <Compass className="w-3.5 h-3.5 text-[#2997ff]" />
                <span>Rotar: Arrastrar con cursor</span>
              </div>

              {/* HQ Origin Tag */}
              <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0066cc]/90 border border-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>HQ: Buenos Aires (-34.60° S, -58.38° W)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Hub Navigator & Logistics Specs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Active Destination Card */}
            <div className="p-6 rounded-[18px] bg-[#1c1c20] border border-white/[0.1] shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedHub.isHQ ? "bg-[#0066cc] text-white" : "bg-[#272729] text-[#2997ff]"}`}>
                    {selectedHub.isHQ ? <MapPin className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white leading-tight flex items-center gap-2">
                      {selectedHub.city}, {selectedHub.country}
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                        {selectedHub.code}
                      </span>
                    </h3>
                    <p className="text-xs text-[#86868b]">{selectedHub.region}</p>
                  </div>
                </div>

                <span className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-full ${
                  selectedHub.isHQ 
                    ? "bg-[#0066cc]/20 text-[#2997ff] border border-[#0066cc]/40" 
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {selectedHub.status}
                </span>
              </div>

              {/* Details Metrics */}
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="p-3.5 rounded-xl bg-[#272729]/60 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-[#86868b] mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#2997ff]" />
                    <span>Tiempo de Tránsito</span>
                  </div>
                  <p className="text-sm font-semibold text-white font-mono">
                    {selectedHub.transitTime}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#272729]/60 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-[#86868b] mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Courier Certificado</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    DHL Express / FedEx
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-[#a1a1a6]">
                <span>Frecuencia de salida: <strong className="text-white">Diaria (24/7)</strong></span>
                <span className="flex items-center gap-1 text-[#2997ff] hover:underline cursor-pointer">
                  Ver tarifas completas <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Destination Selector Tabs */}
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#86868b] mb-3">
                Seleccionar Hub de Destino:
              </p>
              <div className="flex flex-wrap gap-2">
                {SHIPPING_HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => setSelectedHub(hub)}
                    type="button"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      selectedHub.id === hub.id
                        ? "bg-[#0066cc] text-white shadow-md scale-[1.02]"
                        : "bg-[#272729] text-[#a1a1a6] hover:text-white hover:bg-[#323236] border border-white/[0.06]"
                    }`}
                  >
                    {hub.isHQ && <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff]" />}
                    {hub.city} ({hub.code})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Bottom Advantage Cards (Apple Store Utility Card Style) */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[18px] bg-[#1c1c20] border border-white/[0.08] flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full bg-[#0066cc]/20 flex items-center justify-center text-[#2997ff] mb-3">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Origen Buenos Aires</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Diseño, confección y control de calidad riguroso en nuestro taller central argentino.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-[18px] bg-[#1c1c20] border border-white/[0.08] flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full bg-[#0066cc]/20 flex items-center justify-center text-[#2997ff] mb-3">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Despachos Express 48h</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Alianzas estratégicas con couriers prioritarios para entrega rápida en todo el mundo.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-[18px] bg-[#1c1c20] border border-white/[0.08] flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full bg-[#0066cc]/20 flex items-center justify-center text-[#2997ff] mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Tracking Satelital</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Código de seguimiento en tiempo real vía WhatsApp y correo desde el minuto cero.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-[18px] bg-[#1c1c20] border border-white/[0.08] flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full bg-[#0066cc]/20 flex items-center justify-center text-[#2997ff] mb-3">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Free Shipping</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Envío gratuito en compras superiores a $150 USD o $120.000 ARS en todo el territorio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
