"use client";

import L from "leaflet";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { getBestCellTower, getClosestCellTowers } from "@/utils/helper";
import { Tower } from "@/types/Tower";
import { Location } from "@/types/Location";
import { CellTowerCoverage } from "./CellTowerCoverage";

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

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// interface SafeLandmark {
//   id: string;
//   name: string;
//   type: string;
//   lat: number;
//   lng: number;
//   rating: number;
// }

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

  const [bestTower, setBestTower] = useState<Tower | null>(null);

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

  const getAllTowers = async () => {

    if (!userLocation) return null;

    const latAsString = userLocation?.lat.toString();
    const lngAsString = userLocation?.lng.toString();

    console.log(latAsString, lngAsString);

    const topTowers = await getClosestCellTowers(latAsString, lngAsString);
    setTowers(topTowers);

    if (!userLocation) {
      console.log("Cannnot find user location");
      return;
    }

    const best = getBestCellTower(
      userLocation.lat,
      userLocation.lng,
      topTowers,
      false
    );
    
    if (best) {
      console.log("Best Recommended Tower:", best.Landmark);
      setBestTower(best);
      // Optionally update UI with best recommendation
    }
  };

  return (
    <>

   {/* {fetchingFootTraffic && (
      <Card className="border-orange-200 bg-orange-50">
          <CardContent className="">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">High Traffic Area Detected</span>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              Network congestion detected. Redirecting to less congested towers.
            </p>
          </CardContent>
        </Card>
    )} */}
      {bestTower && (
        <Card className="border-orange-200 bg-green-50">
          <CardContent className="">
            <div className="flex items-center gap-2 text-green-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Low Congestion Area Detected</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your strongest network signal is towards {bestTower.Landmark}
            </p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Coverage Map
          </CardTitle>
          <button className="cursor-pointer" onClick={getAllTowers}>
            Find Better Service
          </button>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden">
            {isMapLoaded && userLocation ? (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={17}
                style={{ height: "100%", width: "100%" }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Cell Tower Markers with Coverage Circles */}
                {towers?.map((tower, index) => {
                  return (
                    <div key={index}>
                      <CellTowerCoverage tower={tower} isOptimal={false} />
                      <Marker
                        position={[tower.Latitude, tower.Longitude]}
                      ></Marker>
                    </div>
                  );
                })}

                {bestTower && (
                  <>
                    <Marker
                      position={[bestTower?.Latitude, bestTower?.Longitude]}
                      icon={greenIcon}
                    ></Marker>
                    <CellTowerCoverage tower={bestTower} isOptimal={true} />
                  </>
                )}

                {/* User Location Marker */}
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={redIcon}
                ></Marker>
              </MapContainer>

            

                 

     
            ) : (
              <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">Loading interactive map...</div>
              </div>
            )}
          </div>
        </CardContent>

        <CardHeader></CardHeader>

        <div className="flex justify-center gap-2 m-6">
          <button
            className="cursor-pointer bg-[#0A8DDF] hover:bg-[#A6E3FF] text-white font-bold py-2 px-4 border-b-4 border-[#0A8DDF]  rounded-xl mb-4"
            onClick={getAllTowers}
          >
            Better Service
          </button>
          <button className="cursor-pointer bg-[#0A8DDF] hover:bg-[#A6E3FF] text-white font-bold py-2 px-4 border-b-4 border-[#0A8DDF] rounded-xl mb-4">
            Coverage
          </button>
        </div>

      </Card>
    </>
  );
}