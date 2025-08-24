"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { getClosestCellTowers } from "@/utils/helper";
import { Tower } from "@/types/Tower";
import { Location } from "@/types/Location";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface SafeLandmark {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  rating: number;
}

interface InteractiveMapProps {
  userLocation: Location | null;
  recommendedLocation: Location | null;
  // cellTowers: CellTower[];
  // safeLandmarks: SafeLandmark[];
  signalStrength: number;
  // nearestTower: CellTower | null;
  isNavigating: boolean;
}

export function InteractiveMap({
  userLocation,
  recommendedLocation,
  // safeLandmarks,
  signalStrength,
  // nearestTower,
  isNavigating,
}: InteractiveMapProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [towers, setTowers] = useState<Tower[]>([]);

  const getNavigationPath = () => {
    if (!userLocation || !recommendedLocation) return [];

    return [
      [userLocation.lat, userLocation.lng],
      [recommendedLocation.lat, recommendedLocation.lng],
    ];
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window !== "undefined") {
        // Import Leaflet CSS dynamically
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        setIsMapLoaded(true);
      }
    };
    initializeMap();
  }, []);

  const getTowers = async () => {
    const topTowers = await getClosestCellTowers();
    setTowers(topTowers);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Interactive Coverage Map
        </CardTitle>
        <button className="cursor-pointer" onClick={getTowers}>
          Find Better Service
        </button>
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
              {towers.map((tower, index) => {
                return (
                  <div key={index}>
                    <Circle
                      center={[tower.Latitude, tower.Longitude]}
                      radius={5}
                      fillColor={"000000"}
                      fillOpacity={0.1}
                      color={"FFFFFF"}
                      weight={2}
                    />
                    <Marker position={[tower.Latitude, tower.Longitude]}>
                      {/* <Popup>
                        <div className="text-sm">
                          <div className="font-bold">
                            📡 {tower.carrier} Tower
                          </div>
                          <div>ID: {tower.id}</div>
                          <div>Frequency: {tower.frequency}</div>
                          <div>Signal: {tower.strength}%</div>
                          <div>Load: {Math.round(loadPercentage)}%</div>
                        </div>
                      </Popup> */}
                    </Marker>
                  </div>
                );
              })}

              {/* User Location Marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}></Marker>
            </MapContainer>
          ) : (
            <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">Loading interactive map...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
