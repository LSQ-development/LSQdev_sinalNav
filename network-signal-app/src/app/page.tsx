"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Wifi, Shield, Clock, Phone, AlertTriangle, Users } from "lucide-react"

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

interface TrafficArea {
  id: string
  name: string
  lat: number
  lng: number
  congestionLevel: "low" | "medium" | "high"
  peakHours: string
}

export default function NetworkSignalApp() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [signalStrength, setSignalStrength] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [recommendedLocation, setRecommendedLocation] = useState<Location | null>(null)
  const [nearestTower, setNearestTower] = useState<CellTower | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [eta, setEta] = useState<string>("")
  const [isHighTraffic, setIsHighTraffic] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const cellTowers: CellTower[] = [
    {
      id: "1",
      lat: -33.9249,
      lng: 18.4241,
      carrier: "Vodacom",
      strength: 85,
      frequency: "5G",
      capacity: 1000,
      currentLoad: 650,
    },
    {
      id: "2",
      lat: -33.918,
      lng: 18.4292,
      carrier: "MTN",
      strength: 78,
      frequency: "4G LTE",
      capacity: 800,
      currentLoad: 720,
    },
    {
      id: "3",
      lat: -33.932,
      lng: 18.41,
      carrier: "Cell C",
      strength: 92,
      frequency: "5G",
      capacity: 1200,
      currentLoad: 400,
    },
    {
      id: "4",
      lat: -33.915,
      lng: 18.435,
      carrier: "Telkom",
      strength: 88,
      frequency: "4G LTE",
      capacity: 900,
      currentLoad: 550,
    },
    {
      id: "5",
      lat: -33.928,
      lng: 18.418,
      carrier: "Vodacom",
      strength: 82,
      frequency: "5G",
      capacity: 1100,
      currentLoad: 800,
    },
  ]

  const safeLandmarks: SafeLandmark[] = [
    { id: "1", name: "V&A Waterfront", type: "Shopping Mall", lat: -33.9067, lng: 18.4219, rating: 4.5 },
    { id: "2", name: "Cape Town Central Library", type: "Library", lat: -33.9249, lng: 18.4241, rating: 4.8 },
    { id: "3", name: "Canal Walk Shopping Centre", type: "Shopping Mall", lat: -33.8908, lng: 18.5056, rating: 4.2 },
    { id: "4", name: "Groote Schuur Hospital", type: "Hospital", lat: -33.9391, lng: 18.4316, rating: 4.6 },
    { id: "5", name: "Cape Town Stadium", type: "Stadium", lat: -33.9034, lng: 18.4108, rating: 4.3 },
  ]

  const trafficAreas: TrafficArea[] = [
    {
      id: "1",
      name: "Cape Town CBD",
      lat: -33.9249,
      lng: 18.4241,
      congestionLevel: "high",
      peakHours: "07:00-09:00, 17:00-19:00",
    },
    {
      id: "2",
      name: "Century City",
      lat: -33.8908,
      lng: 18.5056,
      congestionLevel: "medium",
      peakHours: "08:00-10:00, 16:00-18:00",
    },
    {
      id: "3",
      name: "Claremont",
      lat: -33.9847,
      lng: 18.4647,
      congestionLevel: "high",
      peakHours: "07:30-09:30, 16:30-18:30",
    },
  ]

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateSignalStrength = (location: Location): number => {
    let maxStrength = 0
    let bestTower: CellTower | null = null

    cellTowers.forEach((tower) => {
      const distance = calculateDistance(location.lat, location.lng, tower.lat, tower.lng)
      const loadFactor = 1 - (tower.currentLoad / tower.capacity) * 0.3 // Reduce signal based on load
      const strength = Math.max(0, (tower.strength - distance * 15) * loadFactor)

      if (strength > maxStrength) {
        maxStrength = strength
        bestTower = tower
      }
    })

    setNearestTower(bestTower)
    return Math.min(100, Math.max(0, maxStrength))
  }

  const checkTrafficArea = (location: Location): boolean => {
    const currentHour = new Date().getHours()

    return trafficAreas.some((area) => {
      const distance = calculateDistance(location.lat, location.lng, area.lat, area.lng)
      const isPeakTime = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19)
      return distance < 2 && area.congestionLevel === "high" && isPeakTime
    })
  }

  const findBestSignalLocation = (currentLocation: Location): Location => {
    let bestLocation = currentLocation
    const bestStrength = calculateSignalStrength(currentLocation)

    // Find tower with best capacity-to-load ratio
    const availableTowers = cellTowers
      .filter((tower) => tower.currentLoad / tower.capacity < 0.8) // Less than 80% capacity
      .sort((a, b) => a.currentLoad / a.capacity - b.currentLoad / b.capacity)

    if (availableTowers.length > 0) {
      const bestTower = availableTowers[0]
      // Position user closer to the best available tower
      bestLocation = {
        lat: bestTower.lat + (Math.random() - 0.5) * 0.002,
        lng: bestTower.lng + (Math.random() - 0.5) * 0.002,
      }
    }

    return bestLocation
  }

  const getCurrentLocation = () => {
    setIsTracking(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          const strength = calculateSignalStrength(location)
          setSignalStrength(strength)
          setIsHighTraffic(checkTrafficArea(location))

          const recommended = findBestSignalLocation(location)
          setRecommendedLocation(recommended)
          setIsTracking(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          const fallbackLocation = { lat: -33.9249, lng: 18.4241 }
          setUserLocation(fallbackLocation)
          setSignalStrength(calculateSignalStrength(fallbackLocation))
          setIsHighTraffic(checkTrafficArea(fallbackLocation))
          setRecommendedLocation(findBestSignalLocation(fallbackLocation))
          setIsTracking(false)
        },
      )
    }
  }

  // Start navigation
  const startNavigation = () => {
    if (recommendedLocation && userLocation) {
      setIsNavigating(true)
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        recommendedLocation.lat,
        recommendedLocation.lng,
      )
      const walkingSpeed = 5 // km/h
      const timeInMinutes = Math.round((distance / walkingSpeed) * 60)
      setEta(`${timeInMinutes} min`)
    }
  }

  // Get signal strength color
  const getSignalColor = (strength: number): string => {
    if (strength >= 80) return "text-green-500"
    if (strength >= 60) return "text-yellow-500"
    if (strength >= 40) return "text-orange-500"
    return "text-red-500"
  }

  // Get signal bars
  const getSignalBars = (strength: number) => {
    const bars = Math.ceil(strength / 25)
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 bg-current ${i < bars ? "opacity-100" : "opacity-30"}`}
        style={{ height: `${(i + 1) * 4}px` }}
      />
    ))
  }

  const createCustomIcon = (color: string, symbol: string) => {
    if (typeof window === "undefined") return null

    // Use dynamic import for Leaflet
    return {
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" strokeWidth="2"/>
          <text x="10" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">${symbol}</text>
        </svg>
      `)}`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }
  }

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
    getCurrentLocation()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">SA Network Provider Portal</h1>
          <p className="text-gray-600">Direct users to optimal cell towers across South Africa</p>
        </div>

        {isHighTraffic && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">High Traffic Area Detected</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Network congestion expected. Redirecting to less congested towers.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Signal Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Current Signal Status
              {nearestTower && (
                <Badge variant="outline" className="ml-2">
                  {nearestTower.carrier}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-end gap-1 ${getSignalColor(signalStrength)}`}>
                  {getSignalBars(signalStrength)}
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(signalStrength)}%</div>
                  <div className="text-sm text-gray-500">Signal Strength</div>
                  {nearestTower && (
                    <div className="text-xs text-gray-400">
                      Tower Load: {Math.round((nearestTower.currentLoad / nearestTower.capacity) * 100)}%
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={getCurrentLocation} disabled={isTracking}>
                {isTracking ? "Scanning..." : "Refresh Location"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Interactive Coverage Map
            </CardTitle>
          </CardHeader>
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
                    <Polyline
                      positions={getNavigationPath()}
                      color="#3b82f6"
                      weight={4}
                      opacity={0.8}
                      dashArray="10, 10"
                    />
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

        {/* Recommendation Card */}
        {recommendedLocation && nearestTower && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Tower Direction Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <Wifi className="h-4 w-4" />
                  Move towards {nearestTower.carrier} tower (200m northeast)
                </div>
                <p className="text-blue-700 text-sm">
                  Tower ID: {nearestTower.id} | Frequency: {nearestTower.frequency}
                </p>
                <p className="text-blue-700 text-sm">
                  Expected signal improvement: +{Math.round(95 - signalStrength)}%
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={startNavigation} className="flex-1">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate to Tower
                </Button>
                {isNavigating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ETA: {eta}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safe Landmarks Nearby
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeLandmarks.slice(0, 4).map((landmark) => (
                <div key={landmark.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{landmark.name}</div>
                    <div className="text-xs text-gray-500">{landmark.type}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ★ {landmark.rating}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nearby Cell Towers (South Africa)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cellTowers.map((tower) => {
                const loadPercentage = Math.round((tower.currentLoad / tower.capacity) * 100)
                const loadColor =
                  loadPercentage > 80 ? "text-red-600" : loadPercentage > 60 ? "text-yellow-600" : "text-green-600"

                return (
                  <div key={tower.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <div>
                        <div className="font-medium">{tower.carrier}</div>
                        <div className="text-sm text-gray-500">
                          {tower.frequency} | ID: {tower.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{tower.strength}%</div>
                      <div className="text-xs text-gray-500">Signal</div>
                      <div className={`text-xs ${loadColor}`}>Load: {loadPercentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
