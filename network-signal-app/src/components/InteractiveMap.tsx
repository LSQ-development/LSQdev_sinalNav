"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false })

interface Location {
  lat: number
  lng: number
}

interface CellTower {
  id: string
  lat: number
  lng: number
  carrier: string
  strength: number
  frequency: string
  capacity: number
  currentLoad: number
}

interface SafeLandmark {
  id: string
  name: string
  type: string
  lat: number
  lng: number
  rating: number
}

interface InteractiveMapProps {
  userLocation: Location | null
  recommendedLocation: Location | null
  cellTowers: CellTower[]
  safeLandmarks: SafeLandmark[]
  signalStrength: number
  nearestTower: CellTower | null
  isNavigating: boolean
}

export function InteractiveMap({
  userLocation,
  recommendedLocation,
  cellTowers,
  safeLandmarks,
  signalStrength,
  nearestTower,
  isNavigating,
}: InteractiveMapProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const getNavigationPath = () => {
    if (!userLocation || !recommendedLocation) return []

    return [
      [userLocation.lat, userLocation.lng],
      [recommendedLocation.lat, recommendedLocation.lng],
    ]
  }

  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window !== "undefined") {
        // Import Leaflet CSS dynamically
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        setIsMapLoaded(true)
      }
    }

    initializeMap()
  }, [])

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Interactive Coverage Map
        </CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden">
          {isMapLoaded && userLocation ? (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Cell Tower Markers with Coverage Circles */}
              {cellTowers.map((tower) => {
                const loadPercentage = (tower.currentLoad / tower.capacity) * 100
                const coverageRadius = (tower.strength / 100) * 1000 // Coverage in meters
                const circleColor = loadPercentage > 80 ? "#ef4444" : loadPercentage > 60 ? "#f59e0b" : "#10b981"

                return (
                  <div key={tower.id}>
                    <Circle
                      center={[tower.lat, tower.lng]}
                      radius={coverageRadius}
                      fillColor={circleColor}
                      fillOpacity={0.1}
                      color={circleColor}
                      weight={2}
                    />
                    <Marker position={[tower.lat, tower.lng]}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-bold">📡 {tower.carrier} Tower</div>
                          <div>ID: {tower.id}</div>
                          <div>Frequency: {tower.frequency}</div>
                          <div>Signal: {tower.strength}%</div>
                          <div>Load: {Math.round(loadPercentage)}%</div>
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                )
              })}

              {/* User Location Marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold">👤 Your Location</div>
                    <div>Signal: {Math.round(signalStrength)}%</div>
                    {nearestTower && <div>Connected to: {nearestTower.carrier}</div>}
                  </div>
                </Popup>
              </Marker>

              {/* Recommended Location Marker */}
              {recommendedLocation && (
                <Marker position={[recommendedLocation.lat, recommendedLocation.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold">⭐ Recommended Location</div>
                      <div>Better signal expected here</div>
                      {nearestTower && <div>Near {nearestTower.carrier} tower</div>}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Navigation Path */}
              {isNavigating && getNavigationPath().length > 0 && (
                <Polyline positions={getNavigationPath() as [number, number][]} color="#3b82f6" weight={4} opacity={0.8} dashArray="10, 10" />
              )}

              {/* Safe Landmarks */}
              {safeLandmarks.map((landmark) => (
                <Marker key={landmark.id} position={[landmark.lat, landmark.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold">🏢 {landmark.name}</div>
                      <div>{landmark.type}</div>
                      <div>Rating: ⭐ {landmark.rating}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">Loading interactive map...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
