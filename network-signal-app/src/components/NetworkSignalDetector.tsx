"use client"

import { useState, useEffect } from "react"

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

interface TrafficArea {
  id: string
  name: string
  lat: number
  lng: number
  congestionLevel: "low" | "medium" | "high"
  peakHours: string
}

interface NetworkSignalDetectorProps {
  onLocationUpdate: (location: Location) => void
  onSignalUpdate: (strength: number) => void
  onTowerUpdate: (tower: CellTower | null) => void
  onTrafficUpdate: (isHighTraffic: boolean) => void
  onRecommendationUpdate: (location: Location) => void
  cellTowers: CellTower[]
  trafficAreas: TrafficArea[]
}

export function NetworkSignalDetector({
  onLocationUpdate,
  onSignalUpdate,
  onTowerUpdate,
  onRecommendationUpdate,
  onTrafficUpdate,
  cellTowers,
  trafficAreas,
}: NetworkSignalDetectorProps) {
  const [isTracking, setIsTracking] = useState(false)

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

    onTowerUpdate(bestTower)
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
          onLocationUpdate(location)
          const strength = calculateSignalStrength(location)
          onSignalUpdate(strength)
          onTrafficUpdate(checkTrafficArea(location))

          const recommended = findBestSignalLocation(location)
          onRecommendationUpdate(recommended)
          setIsTracking(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          const fallbackLocation = { lat: -33.9249, lng: 18.4241 }
          onLocationUpdate(fallbackLocation)
          onSignalUpdate(calculateSignalStrength(fallbackLocation))
          onTrafficUpdate(checkTrafficArea(fallbackLocation))
          onRecommendationUpdate(findBestSignalLocation(fallbackLocation))
          setIsTracking(false)
        },
      )
    }
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return {
    getCurrentLocation,
    isTracking,
  }
}
