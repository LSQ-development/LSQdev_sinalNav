"use client"

import { Circle } from "react-leaflet"
import { Tower } from "@/types/Tower"

interface CellTowerCoverageProps {
  tower: Tower
}

export function CellTowerCoverage({ tower }: CellTowerCoverageProps) {
  return (
    <Circle
      center={[tower.Latitude, tower.Longitude]}
      radius={(tower.Range)/10} // Use tower range
      pathOptions={{
        color: "blue",      // Circle outline color
        weight: 2,          // Outline thickness
        fillColor: "blue",  // Fill color
        fillOpacity: 0.15,  // Transparency
      }}
    />
  )
}
