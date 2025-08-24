"use client"

import { Navigation, Clock, Wifi } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Location {
  lat: number
  lng: number
}

interface CellTower {
  id: string
  carrier: string
  frequency: string
}

interface NavigationPanelProps {
  recommendedLocation: Location | null
  nearestTower: CellTower | null
  signalStrength: number
  isNavigating: boolean
  eta: string
  onStartNavigation: () => void
}

export function NavigationPanel({
  recommendedLocation,
  nearestTower,
  signalStrength,
  isNavigating,
  eta,
  onStartNavigation,
}: NavigationPanelProps) {
  if (!recommendedLocation || !nearestTower) return null

  return (
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
          <p className="text-blue-700 text-sm">Expected signal improvement: +{Math.round(95 - signalStrength)}%</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onStartNavigation} className="flex-1">
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
  )
}
