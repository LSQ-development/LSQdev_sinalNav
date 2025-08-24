"use client"

import { Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CellTower {
  id: string
  carrier: string
  currentLoad: number
  capacity: number
}

interface SignalStrengthIndicatorProps {
  signalStrength: number
  nearestTower: CellTower | null
  onRefresh: () => void
  isTracking: boolean
}

export function SignalStrengthIndicator({
  signalStrength,
  nearestTower,
  onRefresh,
  isTracking,
}: SignalStrengthIndicatorProps) {
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

  return (
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
          <Button onClick={onRefresh} disabled={isTracking}>
            {isTracking ? "Scanning..." : "Refresh Location"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
