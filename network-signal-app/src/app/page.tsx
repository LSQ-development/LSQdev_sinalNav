"use client";

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Home, Search, ShoppingBag, MapPin } from "lucide-react"

// Dynamically import Leaflet components to avoid SSR on server
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false })

type LatLng = { lat: number; lng: number }

type Hotspot = { id: string; position: LatLng; strength: number }

export default function InsiteApp() {
  const [center, setCenter] = useState<LatLng | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "search" | "product">("home")
  const [query, setQuery] = useState("")
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [establishments, setEstablishments] = useState<{ id: string; name: string; position: LatLng }[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
      setIsReady(true)
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCenter({ lat: -33.9249, lng: 18.4241 })
      )
    } else {
      setCenter({ lat: -33.9249, lng: 18.4241 })
    }
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (data && data.lat && data.lng) {
        const newCenter = { lat: data.lat, lng: data.lng }
        setCenter(newCenter)

        // Create mock hotspots around the searched area to represent towers
        const generated: Hotspot[] = Array.from({ length: 4 }).map((_, i) => {
          const dx = (Math.random() - 0.5) * 0.02
          const dy = (Math.random() - 0.5) * 0.02
          return {
            id: `hs_${i}`,
            position: { lat: newCenter.lat + dx, lng: newCenter.lng + dy },
            strength: 500 + Math.round(Math.random() * 800), // meters
          }
        })
        setHotspots(generated)

        const estRes = await fetch(`/api/amenities?lat=${newCenter.lat}&lng=${newCenter.lng}&radius=1500`)
        const estData = await estRes.json()
        setEstablishments(
          (estData?.results || []).map((n: any, idx: number) => ({
            id: `${n.id ?? idx}`,
            name: n.name,
            position: { lat: n.lat, lng: n.lng },
          }))
        )
      }
      setActiveTab("home")
    } catch (err) {
      console.error(err)
    }
  }

  const MapUI = useMemo(() => {
    if (!isReady || !center) return (
      <div className="h-full w-full flex items-center justify-center text-gray-400">Loading map…</div>
    )
    return (
      <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Current center marker */}
        <Marker position={[center.lat, center.lng]}>
          <Popup>
            <div className="text-sm">Insite focus point</div>
          </Popup>
        </Marker>

        {/* Hotspots with coverage circles */}
        {hotspots.map((h) => (
          <Marker key={h.id} position={[h.position.lat, h.position.lng]}>
            <Popup>
              <div className="text-sm">Signal hotspot</div>
            </Popup>
          </Marker>
        ))}
        {hotspots.map((h) => (
          <Circle key={`${h.id}_c`} center={[h.position.lat, h.position.lng]} radius={h.strength} pathOptions={{ color: "#6b7280" }} />
        ))}

        {/* Establishments inside good zones */}
        {establishments.map((e) => (
          <Marker key={e.id} position={[e.position.lat, e.position.lng]}>
            <Popup>
              <div className="text-sm">{e.name}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    )
  }, [isReady, center, hotspots, establishments])

  return (
    <div className="h-screen w-screen bg-black text-gray-300">
      {/* Header brand minimal */}
      <div className="absolute top-3 left-4 z-[500]">
        <div className="text-lg font-semibold tracking-tight">Insite</div>
        <div className="text-xs text-gray-500">Insight into your connection</div>
      </div>

      {/* Search overlay when active */}
      {activeTab === "search" && (
        <div className="absolute inset-x-0 top-0 z-[600] p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-neutral-900 border border-gray-700 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search an area…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 transition">
              Go
            </button>
          </form>
          {/* Suggestions list */}
          {establishments.length > 0 && (
            <div className="mt-3 max-h-60 overflow-auto rounded-xl border border-gray-800 bg-neutral-950/80 backdrop-blur">
              {establishments.slice(0, 6).map((e) => (
                <div key={e.id} className="px-3 py-2 text-sm text-gray-300 border-b border-gray-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" /> {e.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map layer */}
      <div className="h-full w-full">{MapUI}</div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-[700]">
        <div className="mx-auto max-w-xl mb-4 px-4">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gray-800 bg-neutral-950/80 backdrop-blur">
            <button
              className={`flex flex-col items-center gap-1 py-3 transition ${activeTab === "home" ? "text-gray-200" : "text-gray-500"}`}
              onClick={() => setActiveTab("home")}
            >
              <Home className="h-5 w-5" />
              <span className="text-[11px]">Home</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 py-3 transition ${activeTab === "search" ? "text-gray-200" : "text-gray-500"}`}
              onClick={() => setActiveTab("search")}
            >
              <Search className="h-5 w-5" />
              <span className="text-[11px]">Search</span>
            </button>
            <button
              className={`flex flex-col items-center gap-1 py-3 transition ${activeTab === "product" ? "text-gray-200" : "text-gray-500"}`}
              onClick={() => setActiveTab("product")}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-[11px]">Products</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Product panel placeholder */}
      {activeTab === "product" && (
        <div className="fixed inset-0 z-[650] pointer-events-none">
          <div className="absolute bottom-20 inset-x-4 pointer-events-auto rounded-2xl border border-gray-800 bg-neutral-950/95 backdrop-blur p-4">
            <div className="text-sm text-gray-400 mb-2">Recommended roaming data options</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-xl border border-gray-800 p-3 bg-black/40">
                <div className="text-gray-200 text-sm">Insite Lite</div>
                <div className="text-xs text-gray-500">1GB • 7 days • Best for quick trips</div>
              </div>
              <div className="rounded-xl border border-gray-800 p-3 bg-black/40">
                <div className="text-gray-200 text-sm">Insite Plus</div>
                <div className="text-xs text-gray-500">5GB • 30 days • Balanced choice</div>
              </div>
              <div className="rounded-xl border border-gray-800 p-3 bg-black/40">
                <div className="text-gray-200 text-sm">Insite Pro</div>
                <div className="text-xs text-gray-500">15GB • 60 days • Power users</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
