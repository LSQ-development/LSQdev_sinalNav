"use client";

import { Circle } from "react-leaflet";
import { Tower } from "@/types/Tower";

interface CellTowerCoverageProps {
  tower: Tower;
  isOptimal: boolean;
}

export function CellTowerCoverage({
  tower,
  isOptimal,
}: CellTowerCoverageProps) {
  return (
    <>
      {isOptimal ? (
        <Circle
          center={[tower.Latitude, tower.Longitude]}
          radius={tower.Range / 10} // Use tower range
          pathOptions={{
            color: "green", // Circle outline color
            weight: 2, // Outline thickness
            fillColor: "green", // Fill color
            fillOpacity: 0.15, // Transparency
          }}
        />
      ) : (
        <Circle
          center={[tower.Latitude, tower.Longitude]}
          radius={tower.Range / 10} // Use tower range
          pathOptions={{
            color: "blue", // Circle outline color
            weight: 2, // Outline thickness
            fillColor: "blue", // Fill color
            fillOpacity: 0.15, // Transparency
          }}
        />
      )}
    </>
  );
}
